import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { convexEnv } from "./lib/config/env";

const DEFAULT_MAX_ATTEMPTS = 3;
const LEASE_MS = 60_000;
const RETRY_DELAY_MS = 30_000;

const payloadValidator = v.union(
  v.object({
    _type: v.literal("message"),
    body: v.string(),
    title: v.optional(v.string()),
  }),
  v.object({
    _type: v.literal("alert"),
    body: v.string(),
    title: v.string(),
  }),
);

const requirePrintSecret = (secret: string) => {
  if (!convexEnv.PRINT_SECRET || secret !== convexEnv.PRINT_SECRET) {
    throw new Error("Unauthorized");
  }
};

export const create = mutation({
  args: {
    availableAt: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
    payload: payloadValidator,
    secret: v.string(),
    source: v.string(),
  },
  async handler(ctx, args) {
    requirePrintSecret(args.secret);

    if (args.idempotencyKey) {
      const existing = await ctx.db
        .query("printJobs")
        .withIndex("by_idempotencyKey", (q) =>
          q.eq("idempotencyKey", args.idempotencyKey),
        )
        .first();

      if (existing) {
        return {
          id: existing._id,
          status: existing.status,
        };
      }
    }

    const now = Date.now();
    const jobId = await ctx.db.insert("printJobs", {
      availableAt: args.availableAt ?? now,
      idempotencyKey: args.idempotencyKey,
      payload: args.payload,
      printState: {
        attempts: 0,
      },
      source: args.source,
      status: "queued",
    });

    return {
      id: jobId,
      status: "queued",
    };
  },
});

export const watchQueue = query({
  args: {
    now: v.number(),
    secret: v.string(),
  },
  async handler(ctx, args) {
    requirePrintSecret(args.secret);

    const queued = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (q) => q.eq("status", "queued"))
      .order("asc")
      .take(10);

    const printing = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (q) => q.eq("status", "printing"))
      .take(50);

    const nextLeaseExpiresAt = printing
      .map((job) => job.printState.leaseExpiresAt)
      .filter((leaseExpiresAt) => leaseExpiresAt !== undefined)
      .sort((a, b) => a - b)[0];

    return {
      nextAvailableAt: queued[0]?.availableAt,
      nextWakeAt: [queued[0]?.availableAt, nextLeaseExpiresAt]
        .filter((timestamp) => timestamp !== undefined)
        .sort((a, b) => a - b)[0],
      readyCount: queued.filter((job) => job.availableAt <= args.now).length,
      stalePrintingCount: printing.filter(
        (job) =>
          job.printState.leaseExpiresAt !== undefined &&
          job.printState.leaseExpiresAt <= args.now,
      ).length,
    };
  },
});

export const claimNext = mutation({
  args: {
    now: v.number(),
    secret: v.string(),
    workerId: v.string(),
  },
  async handler(ctx, args) {
    requirePrintSecret(args.secret);

    const printing = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (q) => q.eq("status", "printing"))
      .take(50);

    for (const job of printing) {
      if (
        job.printState.leaseExpiresAt !== undefined &&
        job.printState.leaseExpiresAt <= args.now
      ) {
        await ctx.db.patch("printJobs", job._id, {
          printState: {
            ...job.printState,
            claimedAt: undefined,
            claimedBy: undefined,
            leaseExpiresAt: undefined,
          },
          status: "queued",
        });
      }
    }

    const candidates = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (q) =>
        q.eq("status", "queued").lte("availableAt", args.now),
      )
      .order("asc")
      .take(20);

    const job = [...candidates].sort(
      (a, b) =>
        a.availableAt - b.availableAt || a._creationTime - b._creationTime,
    )[0];

    if (!job) {
      return undefined;
    }

    const printState = {
      ...job.printState,
      attempts: job.printState.attempts + 1,
      claimedAt: args.now,
      claimedBy: args.workerId,
      leaseExpiresAt: args.now + LEASE_MS,
    };

    await ctx.db.patch("printJobs", job._id, {
      printState,
      status: "printing",
    });

    return {
      ...job,
      printState,
      status: "printing" as const,
    };
  },
});

export const markPrinted = mutation({
  args: {
    jobId: v.id("printJobs"),
    secret: v.string(),
    workerId: v.string(),
  },
  async handler(ctx, args) {
    requirePrintSecret(args.secret);

    const now = Date.now();
    const job = await ctx.db.get("printJobs", args.jobId);

    if (
      job?.status !== "printing" ||
      job.printState.claimedBy !== args.workerId
    ) {
      throw new Error("Job is not claimed by this worker");
    }

    await ctx.db.patch("printJobs", args.jobId, {
      printState: {
        ...job.printState,
        leaseExpiresAt: undefined,
        printedAt: now,
      },
      status: "printed",
    });

    return { ok: true };
  },
});

export const markFailed = mutation({
  args: {
    error: v.string(),
    jobId: v.id("printJobs"),
    secret: v.string(),
    workerId: v.string(),
  },
  async handler(ctx, args) {
    requirePrintSecret(args.secret);

    const now = Date.now();
    const job = await ctx.db.get("printJobs", args.jobId);

    if (
      job?.status !== "printing" ||
      job.printState.claimedBy !== args.workerId
    ) {
      throw new Error("Job is not claimed by this worker");
    }

    const shouldRetry = job.printState.attempts < DEFAULT_MAX_ATTEMPTS;

    await ctx.db.patch("printJobs", args.jobId, {
      availableAt: shouldRetry ? now + RETRY_DELAY_MS : job.availableAt,
      printState: {
        ...job.printState,
        claimedAt: undefined,
        claimedBy: undefined,
        failedAt: shouldRetry ? undefined : now,
        lastError: args.error,
        leaseExpiresAt: undefined,
      },
      status: shouldRetry ? "queued" : "failed",
    });

    return { retrying: shouldRetry };
  },
});
