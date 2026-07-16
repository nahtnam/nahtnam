/* oxlint-disable sonarjs/no-undefined-assignment */
import { v } from "convex/values";

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

export const create = convex
  .mutation()
  .input({
    availableAt: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
    payload: payloadValidator,
    secret: v.string(),
    source: v.string(),
  })
  .handler(async (ctx, args) => {
    requirePrintSecret(args.secret);

    if (args.idempotencyKey) {
      const existing = await ctx.db
        .query("printJobs")
        .withIndex("by_idempotencyKey", (query) =>
          query.eq("idempotencyKey", args.idempotencyKey)
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
    const id = await ctx.db.insert("printJobs", {
      availableAt: args.availableAt ?? now,
      idempotencyKey: args.idempotencyKey,
      payload: args.payload,
      printState: {
        attempts: 0,
      },
      source: args.source,
      status: "queued",
    });

    return { id, status: "queued" as const };
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

    const [queued, printing] = await Promise.all([
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
    const wakeTimes = [nextAvailableAt, nextLeaseExpiresAt].filter(
      (timestamp) => timestamp !== undefined
    );

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

    const printing = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (query) =>
        query.eq("status", "printing")
      )
      .take(50);

    const staleJobs = printing.filter(
      (job) =>
        job.printState.leaseExpiresAt !== undefined &&
        job.printState.leaseExpiresAt <= args.now
    );

    await Promise.all(
      staleJobs.map((job) =>
        ctx.db.patch("printJobs", job._id, {
          printState: {
            ...job.printState,
            claimedAt: undefined,
            claimedBy: undefined,
            leaseExpiresAt: undefined,
          },
          status: "queued",
        })
      )
    );

    const candidates = await ctx.db
      .query("printJobs")
      .withIndex("by_status_availableAt", (query) =>
        query.eq("status", "queued").lte("availableAt", args.now)
      )
      .order("asc")
      .take(20);
    const [job] = candidates.toSorted(
      (left, right) =>
        left.availableAt - right.availableAt ||
        left._creationTime - right._creationTime
    );

    if (!job) {
      return;
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

    await ctx.db.patch("printJobs", args.jobId, {
      printState: {
        ...job.printState,
        leaseExpiresAt: undefined,
        printedAt: Date.now(),
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
