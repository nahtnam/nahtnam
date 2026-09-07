/* oxlint-disable sonarjs/no-undefined-assignment */
import { ConvexError, v } from "convex/values";

import { isPrintActionPath } from "../src/print-path";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { getPrimarySettings, isPending } from "./ai-helpers";
import {
  recordReceiptDispatched,
  releaseReceiptReservation,
  reserveReceiptForRetry,
} from "./ai-receipt-delivery";
import { convex } from "./fluent";
import { requirePrintSecret } from "./lib/secrets";

const DEFAULT_MAX_ATTEMPTS = 3;
const LEASE_MS = 60_000;
const RETRY_DELAY_MS = 30_000;
const TEXT_MESSAGE_CHANNEL = "twilio-sms";
const TEXT_MESSAGE_DAILY_LIMIT = 50;
const TEXT_MESSAGE_GLOBAL_DAILY_LIMIT = 150;
const TEXT_MESSAGE_HOURLY_LIMIT = 30;
const TEXT_MESSAGE_PENDING_LIMIT = 25;
const TEXT_MESSAGE_BURST_LIMIT = 12;
const TEXT_MESSAGE_BURST_WINDOW_MS = 5 * 60_000;
const TEXT_MESSAGE_HOURLY_WINDOW_MS = 60 * 60_000;
const TEXT_MESSAGE_DAILY_WINDOW_MS = 24 * 60 * 60_000;

const payloadValidator = v.union(
  v.object({
    _type: v.literal("message"),
    actionPath: v.optional(v.string()),
    body: v.string(),
    title: v.optional(v.string()),
  }),
  v.object({
    _type: v.literal("alert"),
    body: v.string(),
    title: v.string(),
  }),
  v.object({
    _type: v.literal("text-message"),
    body: v.string(),
    from: v.string(),
  })
);

type CreatePrintJobInput = {
  aiReceiptId?: Id<"aiReceipts">;
  availableAt?: number;
  expiresAt?: number;
  idempotencyKey?: string;
  payload: Doc<"printJobs">["payload"];
  source: string;
};

function invalidState(message: string): never {
  throw new ConvexError({ code: "INVALID_STATE", message });
}

function isExpired(job: { expiresAt?: number }, now: number) {
  return job.expiresAt !== undefined && job.expiresAt <= now;
}

async function expirePrintJob(
  ctx: MutationCtx,
  job: Doc<"printJobs">,
  now: number
) {
  if (job.aiReceiptId) {
    await releaseReceiptReservation(ctx, job.aiReceiptId);
  }
  await ctx.db.patch("printJobs", job._id, {
    printState: {
      ...job.printState,
      claimedAt: undefined,
      claimedBy: undefined,
      expiredAt: now,
      leaseExpiresAt: undefined,
    },
    status: "expired",
  });
  return { id: job._id, status: "expired" as const };
}

async function cancelQueuedReceipt(
  ctx: MutationCtx,
  job: Doc<"printJobs">,
  reason: string,
  now: number
) {
  if (job.aiReceiptId) {
    await releaseReceiptReservation(ctx, job.aiReceiptId);
  }
  await ctx.db.patch("printJobs", job._id, {
    printState: {
      ...job.printState,
      cancelledAt: now,
      lastError: `Receipt cancelled: ${reason}`,
    },
    status: "cancelled",
  });
}

async function staleReceiptReason(
  ctx: MutationCtx,
  job: Doc<"printJobs">,
  now: number
) {
  if (!job.aiReceiptId) {
    return null;
  }
  const [receipt, settings] = await Promise.all([
    ctx.db.get("aiReceipts", job.aiReceiptId),
    getPrimarySettings(ctx),
  ]);
  if (
    !receipt ||
    receipt.printJobId !== job._id ||
    receipt.items.length === 0
  ) {
    return "the action receipt is unavailable";
  }
  if (
    !settings ||
    receipt.ownerTokenIdentifier !== settings.ownerTokenIdentifier
  ) {
    return "the action center owner changed";
  }
  if (!settings.paperEnabled) {
    return "paper delivery is paused";
  }
  if (receipt.expiresAt <= now) {
    return "the action receipt expired";
  }
  const pausedSources = new Set(settings.pausedSources);
  const checks = await Promise.all(
    receipt.items.map(async (snapshot) => {
      const item = await ctx.db.get("aiItems", snapshot.itemId);
      if (!item || item.ownerTokenIdentifier !== receipt.ownerTokenIdentifier) {
        return "an action is unavailable";
      }
      if (pausedSources.has(item.source)) {
        return "an action source is paused";
      }
      if (!isPending(item, now)) {
        return "an action was completed, dismissed or snoozed";
      }
      if (item.version !== snapshot.version || item.code !== snapshot.code) {
        return "an action changed after the receipt was prepared";
      }
      if (item.usefulUntil <= now || item.evidenceAt > now) {
        return "an action is no longer useful now";
      }
      if (item.pendingReceiptId !== receipt._id) {
        return "an action has a different delivery reservation";
      }
      return null;
    })
  );
  return checks.find((reason) => reason !== null) ?? null;
}

async function currentCandidate(
  ctx: MutationCtx,
  job: Doc<"printJobs">,
  now: number
) {
  if (isExpired(job, now)) {
    await expirePrintJob(ctx, job, now);
    return null;
  }
  const reason = await staleReceiptReason(ctx, job, now);
  if (reason) {
    await cancelQueuedReceipt(ctx, job, reason, now);
    return null;
  }
  return job;
}

// Only call these helpers after the caller's machine/admin authorization. They
// keep receipt publishing and its print job in the same database transaction.
export async function createPrintJob(
  ctx: MutationCtx,
  args: CreatePrintJobInput
) {
  if (
    args.payload._type === "message" &&
    args.payload.actionPath !== undefined &&
    !isPrintActionPath(args.payload.actionPath)
  ) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: "Action path must stay within /ai",
    });
  }
  for (const timestamp of [args.availableAt, args.expiresAt]) {
    if (
      timestamp !== undefined &&
      (!Number.isFinite(timestamp) || timestamp < 0)
    ) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Print times must be finite epoch milliseconds",
      });
    }
  }

  if (args.idempotencyKey) {
    const existing = await ctx.db
      .query("printJobs")
      .withIndex("by_idempotencyKey", (query) =>
        query.eq("idempotencyKey", args.idempotencyKey)
      )
      .first();

    if (existing) {
      return { id: existing._id, status: existing.status };
    }
  }

  const now = Date.now();
  const status = isExpired(args, now) ? "expired" : "queued";
  const id = await ctx.db.insert("printJobs", {
    aiReceiptId: args.aiReceiptId,
    availableAt: args.availableAt ?? now,
    expiresAt: args.expiresAt,
    idempotencyKey: args.idempotencyKey,
    payload: args.payload,
    printState: {
      attempts: 0,
      expiredAt: status === "expired" ? now : undefined,
    },
    source: args.source,
    status,
  });
  return { id, status };
}

export async function cancelPrintJob(ctx: MutationCtx, jobId: Id<"printJobs">) {
  const job = await ctx.db.get("printJobs", jobId);
  if (!job) {
    return invalidState("Print job not found");
  }
  if (job.status === "cancelled" || job.status === "expired") {
    return { id: job._id, status: job.status };
  }
  if (job.status !== "queued" && job.status !== "failed") {
    return invalidState("Only queued or failed jobs can be cancelled");
  }
  const now = Date.now();
  if (isExpired(job, now)) {
    return expirePrintJob(ctx, job, now);
  }
  if (job.aiReceiptId) {
    await releaseReceiptReservation(ctx, job.aiReceiptId);
  }
  await ctx.db.patch("printJobs", jobId, {
    printState: { ...job.printState, cancelledAt: now },
    status: "cancelled",
  });
  return { id: job._id, status: "cancelled" as const };
}

export async function retryPrintJob(ctx: MutationCtx, jobId: Id<"printJobs">) {
  const job = await ctx.db.get("printJobs", jobId);
  if (!job) {
    return invalidState("Print job not found");
  }
  if (job.status !== "failed") {
    return invalidState("Only failed jobs can be retried");
  }
  const now = Date.now();
  if (isExpired(job, now)) {
    return expirePrintJob(ctx, job, now);
  }
  if (job.aiReceiptId) {
    await reserveReceiptForRetry(ctx, job.aiReceiptId, now);
  }
  await ctx.db.patch("printJobs", jobId, {
    availableAt: now,
    printState: {
      ...job.printState,
      attempts: 0,
      claimedAt: undefined,
      claimedBy: undefined,
      failedAt: undefined,
      leaseExpiresAt: undefined,
      retryCount: (job.printState.retryCount ?? 0) + 1,
    },
    status: "queued",
  });
  return { id: job._id, status: "queued" as const };
}

export const create = convex
  .mutation()
  .input({
    availableAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
    payload: payloadValidator,
    secret: v.string(),
    source: v.string(),
  })
  .handler((ctx, args) => {
    requirePrintSecret(args.secret);
    return createPrintJob(ctx, args);
  })
  .public();

export const cancel = convex
  .mutation()
  .input({ jobId: v.id("printJobs"), secret: v.string() })
  .handler((ctx, args) => {
    requirePrintSecret(args.secret);
    return cancelPrintJob(ctx, args.jobId);
  })
  .public();

export const retry = convex
  .mutation()
  .input({ jobId: v.id("printJobs"), secret: v.string() })
  .handler((ctx, args) => {
    requirePrintSecret(args.secret);
    return retryPrintJob(ctx, args.jobId);
  })
  .public();

export const getStatus = convex
  .query()
  .input({ jobId: v.id("printJobs"), secret: v.string() })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);
    const job = await ctx.db.get("printJobs", args.jobId);
    if (!job) {
      return null;
    }
    return {
      availableAt: job.availableAt,
      expiresAt: job.expiresAt,
      id: job._id,
      idempotencyKey: job.idempotencyKey,
      printState: job.printState,
      status: job.status,
    };
  })
  .public();

export const createTextMessage = convex
  .mutation()
  .input({
    body: v.string(),
    from: v.string(),
    messageSid: v.string(),
    secret: v.string(),
  })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);

    const existing = await ctx.db
      .query("printJobs")
      .withIndex("by_idempotencyKey", (query) =>
        query.eq("idempotencyKey", args.messageSid)
      )
      .first();

    if (existing) {
      return { status: "duplicate" as const };
    }

    const now = Date.now();
    const source = `${TEXT_MESSAGE_CHANNEL}:${args.from}`;
    const [recentFromSender, recentGlobally, queued, printing] =
      await Promise.all([
        ctx.db
          .query("printJobs")
          .withIndex("by_source", (query) => query.eq("source", source))
          .order("desc")
          .take(TEXT_MESSAGE_DAILY_LIMIT),
        ctx.db
          .query("printJobs")
          .withIndex("by_channel", (query) =>
            query.eq("channel", TEXT_MESSAGE_CHANNEL)
          )
          .order("desc")
          .take(TEXT_MESSAGE_GLOBAL_DAILY_LIMIT),
        ctx.db
          .query("printJobs")
          .withIndex("by_status_availableAt", (query) =>
            query.eq("status", "queued")
          )
          .take(TEXT_MESSAGE_PENDING_LIMIT),
        ctx.db
          .query("printJobs")
          .withIndex("by_status_availableAt", (query) =>
            query.eq("status", "printing")
          )
          .take(TEXT_MESSAGE_PENDING_LIMIT),
      ]);

    const isSenderLimited = [
      {
        limit: TEXT_MESSAGE_BURST_LIMIT,
        windowMs: TEXT_MESSAGE_BURST_WINDOW_MS,
      },
      {
        limit: TEXT_MESSAGE_HOURLY_LIMIT,
        windowMs: TEXT_MESSAGE_HOURLY_WINDOW_MS,
      },
      {
        limit: TEXT_MESSAGE_DAILY_LIMIT,
        windowMs: TEXT_MESSAGE_DAILY_WINDOW_MS,
      },
    ].some(({ limit, windowMs }) => {
      const recentCount = recentFromSender.filter(
        (job) => job._creationTime >= now - windowMs
      ).length;

      return recentCount >= limit;
    });
    const recentGlobalCount = recentGlobally.filter(
      (job) => job._creationTime >= now - TEXT_MESSAGE_DAILY_WINDOW_MS
    ).length;
    const isGloballyLimited =
      recentGlobalCount >= TEXT_MESSAGE_GLOBAL_DAILY_LIMIT;
    const isBacklogged =
      queued.length + printing.length >= TEXT_MESSAGE_PENDING_LIMIT;

    if (isSenderLimited || isGloballyLimited || isBacklogged) {
      return { status: "rate-limited" as const };
    }

    const id = await ctx.db.insert("printJobs", {
      availableAt: now,
      channel: TEXT_MESSAGE_CHANNEL,
      idempotencyKey: args.messageSid,
      payload: {
        _type: "text-message",
        body: args.body,
        from: args.from,
      },
      printState: {
        attempts: 0,
      },
      source,
      status: "queued",
    });

    return { id, status: "queued" as const };
  })
  .public();

export const watchQueue = convex
  .query()
  .input({
    now: v.number(),
    secret: v.string(),
  })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);

    const [queued, printing, nextExpiring] = await Promise.all([
      ctx.db
        .query("printJobs")
        .withIndex("by_status_availableAt", (query) =>
          query.eq("status", "queued")
        )
        .order("asc")
        .take(10),
      ctx.db
        .query("printJobs")
        .withIndex("by_status_availableAt", (query) =>
          query.eq("status", "printing")
        )
        .take(50),
      ctx.db
        .query("printJobs")
        .withIndex("by_status_expiresAt", (query) =>
          query.eq("status", "queued").gte("expiresAt", 0)
        )
        .first(),
    ]);
    const leaseExpirations = printing.flatMap((job) =>
      job.printState.leaseExpiresAt === undefined
        ? []
        : [job.printState.leaseExpiresAt]
    );
    const nextLeaseExpiresAt =
      leaseExpirations.length > 0 ? Math.min(...leaseExpirations) : undefined;
    const [nextAvailableJob] = queued;
    const nextAvailableAt = nextAvailableJob?.availableAt;
    const wakeTimes = [
      nextAvailableAt,
      nextLeaseExpiresAt,
      nextExpiring?.expiresAt,
    ].filter((timestamp) => timestamp !== undefined);

    return {
      nextAvailableAt,
      nextWakeAt: wakeTimes.length > 0 ? Math.min(...wakeTimes) : undefined,
      readyCount: queued.filter((job) => job.availableAt <= args.now).length,
      stalePrintingCount: printing.filter(
        (job) =>
          job.printState.leaseExpiresAt !== undefined &&
          job.printState.leaseExpiresAt <= args.now
      ).length,
    };
  })
  .public();

export const claimNext = convex
  .mutation()
  .input({
    now: v.number(),
    secret: v.string(),
    workerId: v.string(),
  })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);
    // The server clock decides usefulness; a reconnecting worker may have an
    // old subscription timestamp or a drifting local clock.
    const now = Date.now();

    const expiring = await Promise.all(
      (["queued", "failed"] as const).map((status) =>
        ctx.db
          .query("printJobs")
          .withIndex("by_status_expiresAt", (query) =>
            query.eq("status", status).gte("expiresAt", 0).lte("expiresAt", now)
          )
          .take(100)
      )
    );
    await Promise.all(
      expiring.flat().map((job) => expirePrintJob(ctx, job, now))
    );

    const printing = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (query) =>
        query.eq("status", "printing")
      )
      .take(50);

    const staleJobs = printing.filter(
      (job) =>
        job.printState.leaseExpiresAt !== undefined &&
        job.printState.leaseExpiresAt <= now
    );

    await Promise.all(
      staleJobs.map((job) => {
        if (isExpired(job, now)) {
          return expirePrintJob(ctx, job, now);
        }
        return ctx.db.patch("printJobs", job._id, {
          printState: {
            ...job.printState,
            claimedAt: undefined,
            claimedBy: undefined,
            leaseExpiresAt: undefined,
          },
          status: "queued",
        });
      })
    );

    const candidates = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (query) =>
        query.eq("status", "queued").lte("availableAt", now)
      )
      .order("asc")
      .take(20);
    // Receipt snapshots are checked in the same transaction as claiming, so a
    // concurrent owner decision or source update cannot authorize stale paper.
    const currentCandidates = await Promise.all(
      candidates.map((candidate) => currentCandidate(ctx, candidate, now))
    );
    const [job] = currentCandidates
      .filter((candidate) => candidate !== null)
      .toSorted(
        (left, right) =>
          left.availableAt - right.availableAt ||
          left._creationTime - right._creationTime
      );

    if (!job) {
      return null;
    }

    const printState = {
      ...job.printState,
      attempts: job.printState.attempts + 1,
      claimedAt: now,
      claimedBy: args.workerId,
      leaseExpiresAt: now + LEASE_MS,
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
  })
  .public();

export const markPrinted = convex
  .mutation()
  .input({
    jobId: v.id("printJobs"),
    secret: v.string(),
    workerId: v.string(),
  })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);

    const job = await ctx.db.get("printJobs", args.jobId);

    if (
      job?.status !== "printing" ||
      job.printState.claimedBy !== args.workerId
    ) {
      throw new Error("Job is not claimed by this worker");
    }

    const now = Date.now();
    if (job.aiReceiptId) {
      await recordReceiptDispatched(ctx, job.aiReceiptId, now);
    }
    await ctx.db.patch("printJobs", args.jobId, {
      printState: {
        ...job.printState,
        leaseExpiresAt: undefined,
        printedAt: now,
      },
      status: "printed",
    });

    return { ok: true as const };
  })
  .public();

export const markFailed = convex
  .mutation()
  .input({
    error: v.string(),
    jobId: v.id("printJobs"),
    secret: v.string(),
    workerId: v.string(),
  })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);

    const now = Date.now();
    const job = await ctx.db.get("printJobs", args.jobId);

    if (
      job?.status !== "printing" ||
      job.printState.claimedBy !== args.workerId
    ) {
      throw new Error("Job is not claimed by this worker");
    }

    const retrying = job.printState.attempts < DEFAULT_MAX_ATTEMPTS;

    if (isExpired(job, now)) {
      await expirePrintJob(ctx, job, now);
      return { retrying: false };
    }

    if (!retrying && job.aiReceiptId) {
      await releaseReceiptReservation(ctx, job.aiReceiptId);
    }

    await ctx.db.patch("printJobs", args.jobId, {
      availableAt: retrying ? now + RETRY_DELAY_MS : job.availableAt,
      printState: {
        ...job.printState,
        claimedAt: undefined,
        claimedBy: undefined,
        failedAt: retrying ? undefined : now,
        lastError: args.error,
        leaseExpiresAt: undefined,
      },
      status: retrying ? "queued" : "failed",
    });

    return { retrying };
  })
  .public();
