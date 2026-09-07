/* oxlint-disable sonarjs/no-undefined-assignment */
import { v } from "convex/values";
import type { Infer } from "convex/values";

import { isAiCommand, normalizeAiCommand } from "../src/ai-command";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  aiError,
  boundedText,
  DAY_MS,
  getPrimarySettings,
  isEligible,
  isPending,
  loadActiveItems,
  loadOwnerHistory,
  ownerSettings,
  publicSettings,
  requireItemOwner,
  requirePrimarySettings,
  timestamp,
} from "./ai-helpers";
import { releaseUnavailableReservations } from "./ai-receipt-delivery";
import { candidateFields, decisionAction } from "./ai-tables";
import { adminMutation, adminQuery, convex } from "./fluent";
import { requireAiSecret } from "./lib/secrets";
import { createPrintJob } from "./print_jobs";

const candidateValidator = v.object({
  ...candidateFields,
  resolution: v.optional(v.literal("resolved")),
});
type Candidate = Infer<typeof candidateValidator>;
type Decision = Infer<typeof decisionAction>;

const viewValidator = v.union(
  v.literal("today"),
  v.literal("upcoming"),
  v.literal("snoozed"),
  v.literal("history")
);

export const getSettings = adminQuery
  .input({})
  .handler(async (ctx) => {
    const settings = await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    return settings ? publicSettings(settings) : { configured: false as const };
  })
  .public();

export const configure = adminMutation
  .input({
    clearPhone: v.optional(v.boolean()),
    paperEnabled: v.optional(v.boolean()),
    pausedSources: v.optional(v.array(v.string())),
    phone: v.optional(v.string()),
  })
  .handler(async (ctx, args) => {
    const settings = await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    if (args.phone !== undefined && !/^\+[1-9]\d{7,14}$/u.test(args.phone)) {
      aiError("Phone must use E.164 format, for example +15555550123");
    }
    if (args.clearPhone && args.phone) {
      aiError("Provide a phone or clear it, not both");
    }
    if (args.pausedSources && args.pausedSources.length > 50) {
      aiError("At most 50 sources may be paused");
    }
    for (const source of args.pausedSources ?? []) {
      boundedText(source, "Source", 80);
    }
    const values = {
      paperEnabled: args.paperEnabled ?? settings?.paperEnabled ?? true,
      pausedSources: args.pausedSources ?? settings?.pausedSources ?? [],
      phone: args.clearPhone ? undefined : (args.phone ?? settings?.phone),
    };
    await (settings
      ? ctx.db.patch("aiSettings", settings._id, values)
      : ctx.db.insert("aiSettings", {
          ...values,
          nextCode: 1,
          ownerTokenIdentifier: ctx.identity.tokenIdentifier,
          singleton: "primary",
        }));
    return { configured: true as const, ...values };
  })
  .public();

export const list = adminQuery
  .input({ limit: v.optional(v.number()), view: viewValidator })
  .handler(async (ctx, args) => {
    const settings = await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    if (!settings) {
      return [];
    }
    const now = Date.now();
    const items =
      args.view === "history"
        ? await loadOwnerHistory(ctx, settings.ownerTokenIdentifier, 200)
        : await loadActiveItems(ctx, settings.ownerTokenIdentifier);
    const matching = items.filter((item) => {
      if (args.view === "history") {
        return item.status === "done" || item.status === "dismissed";
      }
      if (args.view === "snoozed") {
        return item.status === "snoozed" && (item.snoozedUntil ?? 0) > now;
      }
      if (args.view === "today") {
        return (
          isPending(item, now) &&
          item.nextNotifyAt <= now &&
          item.usefulUntil > now
        );
      }
      return (
        isPending(item, now) &&
        (item.nextNotifyAt > now || item.usefulUntil <= now)
      );
    });
    return matching
      .toSorted(
        (a, b) => (a.dueAt ?? a.nextNotifyAt) - (b.dueAt ?? b.nextNotifyAt)
      )
      .slice(0, Math.max(1, Math.min(200, Math.floor(args.limit ?? 100))));
  })
  .public();

export const getItem = adminQuery
  .input({ code: v.string() })
  .handler(async (ctx, args) => {
    await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    const item = await ctx.db
      .query("aiItems")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
    if (!item || item.ownerTokenIdentifier !== ctx.identity.tokenIdentifier) {
      return null;
    }
    const actions = await ctx.db
      .query("aiActions")
      .withIndex("by_itemId_and_at", (q) => q.eq("itemId", item._id))
      .order("desc")
      .take(20);
    return { actions, item };
  })
  .public();

export const getReceipt = adminQuery
  .input({ id: v.id("aiReceipts") })
  .handler(async (ctx, args) => {
    await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    const receipt = await ctx.db.get("aiReceipts", args.id);
    if (
      !receipt ||
      receipt.ownerTokenIdentifier !== ctx.identity.tokenIdentifier
    ) {
      return null;
    }
    const items = await Promise.all(
      receipt.items.map(async (snapshot) => {
        const item = await ctx.db.get("aiItems", snapshot.itemId);
        const current =
          item?.ownerTokenIdentifier === ctx.identity.tokenIdentifier
            ? item
            : null;
        return {
          changed: !current || current.version !== snapshot.version,
          current,
          snapshot,
        };
      })
    );
    return { expired: receipt.expiresAt <= Date.now(), items, receipt };
  })
  .public();

export const health = adminQuery
  .input({})
  .handler(async (ctx) => {
    const settings = await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    if (!settings) {
      return {
        configured: false,
        deliveries: [],
        receipts: [],
        settings: null,
        sources: [],
      };
    }
    const [sources, receipts, deliveries] = await Promise.all([
      ctx.db
        .query("aiHealth")
        .withIndex("by_ownerTokenIdentifier_and_source", (q) =>
          q.eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
        )
        .take(50),
      ctx.db
        .query("aiReceipts")
        .withIndex("by_ownerTokenIdentifier_and_createdAt", (q) =>
          q.eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
        )
        .order("desc")
        .take(20),
      ctx.db
        .query("aiSmsDeliveries")
        .withIndex("by_ownerTokenIdentifier_and_updatedAt", (q) =>
          q.eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
        )
        .order("desc")
        .take(20),
    ]);
    const receiptStatuses = await Promise.all(
      receipts.map(async (receipt) => {
        const job = receipt.printJobId
          ? await ctx.db.get("printJobs", receipt.printJobId)
          : null;
        return {
          ...receipt,
          expired: receipt.expiresAt <= Date.now(),
          printError: job?.printState.lastError,
          printStatus: job?.status ?? "missing",
        };
      })
    );
    return {
      configured: true,
      deliveries,
      receipts: receiptStatuses,
      settings: {
        paperEnabled: settings.paperEnabled,
        phoneConfigured: Boolean(settings.phone),
      },
      sources: sources.map((source) => ({
        ...source,
        stale: Date.now() - source.checkedAt > DAY_MS,
      })),
    };
  })
  .public();

function validateCandidate(item: Candidate, now: number) {
  boundedText(item.source, "Source", 80);
  boundedText(item.sourceKey, "Source key", 160);
  boundedText(item.title, "Title", 120);
  boundedText(item.whyNow, "Why now", 360);
  for (const [label, value] of Object.entries({
    checkedAt: item.checkedAt,
    evidenceAt: item.evidenceAt,
    nextNotifyAt: item.nextNotifyAt,
    usefulUntil: item.usefulUntil,
  })) {
    timestamp(value, label);
  }
  if (item.dueAt !== undefined) {
    timestamp(item.dueAt, "Due date");
  }
  if (item.evidenceAt > item.checkedAt || item.checkedAt > now + 60_000) {
    aiError("Evidence cannot be newer than its check, or checks in the future");
  }
  if (item.sourceUrl) {
    boundedText(item.sourceUrl, "Source URL", 1500);
    if (!/^https?:\/\//iu.test(item.sourceUrl)) {
      aiError("Source URL must use http or https");
    }
  }
  if ((item.kind === "question") !== Boolean(item.question)) {
    aiError("Question items require explicit yes/no labels and outcomes");
  }
  if (item.question) {
    boundedText(item.question.yesLabel, "Yes label", 100);
    boundedText(item.question.noLabel, "No label", 100);
  }
  if (item.questionPurpose === "relevance") {
    const outcomes =
      item.question?.yesOutcome === "open" &&
      item.question.noOutcome === "dismissed";
    if (item.kind !== "question" || !outcomes || item.priority !== "routine") {
      aiError(
        "Relevance questions must be routine: Yes confirms relevance and stays open; No dismisses"
      );
    }
  }
  if (item.priority === "urgent" && !item.urgentMilestone) {
    aiError("Urgent items require an explicit, stable milestone");
  }
  if (item.urgentMilestone) {
    boundedText(item.urgentMilestone, "Urgent milestone", 120);
  }
}

function semanticValue(item: Candidate | Doc<"aiItems">) {
  return JSON.stringify({
    dueAt: item.dueAt,
    kind: item.kind,
    ownership: item.ownership,
    priority: item.priority,
    question: item.question,
    questionPurpose: item.questionPurpose,
    sourceUrl: item.sourceUrl,
    title: item.title,
    urgentMilestone: item.urgentMilestone,
    whyNow: item.whyNow,
  });
}

function preserveUserChoice(
  current: Doc<"aiItems">,
  input: Candidate,
  now: number
) {
  if (current.userResolutionAt === undefined) {
    return false;
  }
  if (current.status === "done" || current.status === "dismissed") {
    return true;
  }
  if (current.status === "snoozed" && (current.snoozedUntil ?? 0) > now) {
    return true;
  }
  const latestEvidence = Math.max(current.evidenceAt, current.userResolutionAt);
  return current.status === "open" && input.evidenceAt <= latestEvidence;
}

function notificationValues(
  current: Doc<"aiItems"> | null,
  input: Candidate,
  changed: boolean
) {
  const freshChange =
    changed && (!current || input.evidenceAt > current.evidenceAt);
  return {
    appearances: freshChange ? 0 : (current?.appearances ?? 0),
    nextNotifyAt: freshChange
      ? input.nextNotifyAt
      : Math.max(input.nextNotifyAt, current?.nextNotifyAt ?? 0),
    usefulUntil:
      current && !freshChange
        ? Math.min(current.usefulUntil, input.usefulUntil)
        : input.usefulUntil,
  };
}

function pendingAnswerValues(
  current: Doc<"aiItems"> | null,
  input: Candidate,
  changed: boolean
) {
  const newerEvidence =
    input.evidenceAt > (current?.userResolutionAt ?? Infinity);
  if (changed && newerEvidence && current?.status === "open") {
    return { decision: undefined, userResolutionAt: undefined };
  }
  return {
    decision: current?.decision,
    userResolutionAt: current?.userResolutionAt,
  };
}

function candidateValues(
  candidate: Candidate,
  current: Doc<"aiItems"> | null,
  owner: string,
  allocateCode: () => string
) {
  const { resolution, ...input } = candidate;
  const changed = !current || semanticValue(current) !== semanticValue(input);
  const sourceResolved =
    resolution && (!current || input.evidenceAt > current.evidenceAt);
  const increment = changed || sourceResolved ? 1 : 0;
  const version = current ? current.version + increment : 1;
  const code = current && !changed ? current.code : allocateCode();
  return {
    ...input,
    ...notificationValues(current, candidate, changed),
    ...pendingAnswerValues(current, candidate, changed),
    code,
    ownerTokenIdentifier: owner,
    resolutionReason: sourceResolved
      ? "source-resolved"
      : current?.resolutionReason,
    status: sourceResolved
      ? ("done" as const)
      : (current?.status ?? ("open" as const)),
    version,
  };
}

async function ingestCandidate(
  ctx: MutationCtx,
  owner: string,
  candidate: Candidate,
  allocateCode: () => string
) {
  const now = Date.now();
  validateCandidate(candidate, now);
  const current = await ctx.db
    .query("aiItems")
    .withIndex("by_ownerTokenIdentifier_and_source_and_sourceKey", (q) =>
      q
        .eq("ownerTokenIdentifier", owner)
        .eq("source", candidate.source)
        .eq("sourceKey", candidate.sourceKey)
    )
    .unique();
  if (
    current &&
    (candidate.checkedAt <= current.checkedAt ||
      candidate.evidenceAt < current.evidenceAt)
  ) {
    return {
      code: current.code,
      id: current._id,
      result: "unchanged" as const,
      version: current.version,
    };
  }
  if (current && preserveUserChoice(current, candidate, now)) {
    await ctx.db.patch("aiItems", current._id, {
      checkedAt: candidate.checkedAt,
    });
    return {
      code: current.code,
      id: current._id,
      result: "user-choice-preserved" as const,
      version: current.version,
    };
  }
  const values = candidateValues(candidate, current, owner, allocateCode);
  const id = current ? current._id : await ctx.db.insert("aiItems", values);
  if (current) {
    await ctx.db.patch("aiItems", id, values);
  }
  return {
    code: values.code,
    id,
    result: current ? ("updated" as const) : ("created" as const),
    version: values.version,
  };
}

export const ingest = convex
  .mutation()
  .input({ items: v.array(candidateValidator), secret: v.string() })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const settings = await requirePrimarySettings(ctx);
    if (args.items.length > 50) {
      aiError("Ingest at most 50 items per request");
    }
    let { nextCode } = settings;
    const allocateCode = () => {
      const code = `A${nextCode}`;
      nextCode += 1;
      return code;
    };
    const results = [];
    // Batch entries may share a source key; preserve order and allocate each
    // new code exactly once inside this transaction.
    for (const candidate of args.items) {
      // oxlint-disable-next-line eslint/no-await-in-loop, react-doctor/async-await-in-loop
      const result = await ingestCandidate(
        ctx,
        settings.ownerTokenIdentifier,
        candidate,
        allocateCode
      );
      results.push(result);
    }
    if (nextCode !== settings.nextCode) {
      await ctx.db.patch("aiSettings", settings._id, { nextCode });
    }
    return { items: results };
  })
  .public();

export const machineSnapshot = convex
  .query()
  .input({ secret: v.string(), source: v.optional(v.string()) })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const settings = await requirePrimarySettings(ctx);
    const { source } = args;
    const settingsView = {
      paperEnabled: settings.paperEnabled,
      pausedSources: settings.pausedSources,
    };
    if (source) {
      const rows = await ctx.db
        .query("aiItems")
        .withIndex("by_ownerTokenIdentifier_and_source_and_sourceKey", (q) =>
          q
            .eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
            .eq("source", source)
        )
        .take(501);
      return {
        coverage: "source-bounded" as const,
        items: rows.slice(0, 500),
        settings: settingsView,
        truncated: rows.length > 500,
      };
    }
    const [active, history] = await Promise.all([
      loadActiveItems(ctx, settings.ownerTokenIdentifier),
      loadOwnerHistory(ctx, settings.ownerTokenIdentifier, 200),
    ]);
    return {
      coverage: "active-and-recent-history" as const,
      items: [...active, ...history],
      settings: settingsView,
      truncated: history.length === 200,
    };
  })
  .public();

export const recordHealth = convex
  .mutation()
  .input({
    checkedAt: v.number(),
    coverageThrough: v.optional(v.number()),
    message: v.optional(v.string()),
    secret: v.string(),
    source: v.string(),
    status: v.union(
      v.literal("ok"),
      v.literal("partial"),
      v.literal("blocked")
    ),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const settings = await requirePrimarySettings(ctx);
    boundedText(args.source, "Source", 80);
    timestamp(args.checkedAt, "Checked at");
    if (args.checkedAt > Date.now() + 60_000) {
      aiError("Health checks cannot be in the future");
    }
    if (args.message) {
      boundedText(args.message, "Health message", 400);
    }
    if (args.coverageThrough !== undefined) {
      timestamp(args.coverageThrough, "Coverage through");
      if (args.coverageThrough > args.checkedAt) {
        aiError("Coverage cannot be newer than its check");
      }
    }
    const current = await ctx.db
      .query("aiHealth")
      .withIndex("by_ownerTokenIdentifier_and_source", (q) =>
        q
          .eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
          .eq("source", args.source)
      )
      .unique();
    if (current && current.checkedAt >= args.checkedAt) {
      return { updated: false };
    }
    const values = {
      checkedAt: args.checkedAt,
      coverageThrough: args.coverageThrough,
      message: args.message,
      ownerTokenIdentifier: settings.ownerTokenIdentifier,
      source: args.source,
      status: args.status,
    };
    await (current
      ? ctx.db.patch("aiHealth", current._id, values)
      : ctx.db.insert("aiHealth", values));
    return { updated: true };
  })
  .public();

function receiptLine(value: string, max: number) {
  return value
    .normalize("NFKD")
    .replaceAll(/[^\u0020-\u007E]/gu, " ")
    .replaceAll(/\s+/gu, " ")
    .trim()
    .slice(0, max);
}

export const publish = convex
  .mutation()
  .input({
    expiresAt: v.optional(v.number()),
    idempotencyKey: v.string(),
    mode: v.optional(v.union(v.literal("actions"), v.literal("timed"))),
    secret: v.string(),
    source: v.optional(v.string()),
    title: v.optional(v.string()),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const settings = await requirePrimarySettings(ctx);
    boundedText(args.idempotencyKey, "Idempotency key", 160);
    if (args.title) {
      boundedText(args.title, "Receipt title", 48);
    }
    const previous = await ctx.db
      .query("aiReceipts")
      .withIndex("by_ownerTokenIdentifier_and_idempotencyKey", (q) =>
        q
          .eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
          .eq("idempotencyKey", args.idempotencyKey)
      )
      .unique();
    if (previous) {
      return {
        count: previous.items.length,
        receiptId: previous._id,
        status: "duplicate" as const,
      };
    }
    if (!settings.paperEnabled) {
      return { count: 0, receiptId: null, status: "paused" as const };
    }
    const now = Date.now();
    const requestedExpiry = args.expiresAt ?? now + 4 * 60 * 60_000;
    timestamp(requestedExpiry, "Receipt expiry");
    if (requestedExpiry <= now || requestedExpiry > now + DAY_MS) {
      aiError("Receipt expiry must be within the next 24 hours");
    }
    const activeItems = await loadActiveItems(
      ctx,
      settings.ownerTokenIdentifier
    );
    await releaseUnavailableReservations(ctx, activeItems, now);
    const ownerItems = await loadActiveItems(
      ctx,
      settings.ownerTokenIdentifier
    );
    const items = ownerItems
      .filter((item) => {
        const matchingSource = !args.source || args.source === item.source;
        const matchingKind =
          args.mode === "timed" ? item.kind === "info" : item.kind !== "info";
        return (
          isEligible(item, settings, now) && matchingSource && matchingKind
        );
      })
      .toSorted(
        (a, b) =>
          Number(b.priority === "urgent") - Number(a.priority === "urgent") ||
          (a.dueAt ?? a.usefulUntil) - (b.dueAt ?? b.usefulUntil)
      )
      .slice(0, 3);
    if (items.length === 0) {
      return { count: 0, receiptId: null, status: "empty" as const };
    }
    const expiresAt = Math.min(
      requestedExpiry,
      ...items.map((item) => item.usefulUntil)
    );
    const title =
      args.title ?? (args.mode === "timed" ? "UP NEXT" : "TODAY'S ACTIONS");
    const receiptId = await ctx.db.insert("aiReceipts", {
      createdAt: now,
      expiresAt,
      idempotencyKey: args.idempotencyKey,
      items: items.map((item) => ({
        code: item.code,
        itemId: item._id,
        title: item.title,
        version: item.version,
        whyNow: item.whyNow,
      })),
      ownerTokenIdentifier: settings.ownerTokenIdentifier,
      title,
    });
    const body = `${items
      .map((item) => {
        const lines = [
          `${item.code} ${receiptLine(item.title, 100)}`,
          receiptLine(item.whyNow, 140),
        ];
        if (item.question) {
          lines.push(
            `Y: ${receiptLine(item.question.yesLabel, 60)}`,
            `N: ${receiptLine(item.question.noLabel, 60)}`
          );
        }
        return lines.join("\n");
      })
      .join("\n\n")}\n\nScan to review or update.`;
    const job = await createPrintJob(ctx, {
      aiReceiptId: receiptId,
      availableAt: now,
      expiresAt,
      idempotencyKey: `ai-receipt:${receiptId}`,
      payload: {
        _type: "message",
        actionPath: `/ai/r/${receiptId}`,
        body,
        title,
      },
      source: "ai-action-center",
    });
    await ctx.db.patch("aiReceipts", receiptId, { printJobId: job.id });
    await Promise.all(
      items.map((item) =>
        ctx.db.patch("aiItems", item._id, { pendingReceiptId: receiptId })
      )
    );
    return { count: items.length, receiptId, status: "queued" as const };
  })
  .public();

function previousState(item: Doc<"aiItems">) {
  return {
    appearances: item.appearances,
    decision: item.decision,
    nextNotifyAt: item.nextNotifyAt,
    ownership: item.ownership,
    resolutionReason: item.resolutionReason,
    snoozedUntil: item.snoozedUntil,
    status: item.status,
    userResolutionAt: item.userResolutionAt,
  };
}

function decisionStatus(
  item: Doc<"aiItems">,
  action: Decision
): Doc<"aiItems">["status"] {
  if (action === "yes" || action === "no") {
    if (!item.question || item.usefulUntil <= Date.now()) {
      aiError(
        "This question is unavailable or expired. Review its current details"
      );
    }
    return action === "yes"
      ? item.question.yesOutcome
      : item.question.noOutcome;
  }
  if (action === "snooze") {
    return "snoozed";
  }
  return action === "ignore" || action === "not_mine" ? "dismissed" : "done";
}

function decisionNotificationTime(
  item: Doc<"aiItems">,
  status: Doc<"aiItems">["status"],
  now: number,
  snoozeUntil?: number
) {
  if (status === "snoozed" && snoozeUntil !== undefined) {
    return snoozeUntil;
  }
  return status === "open"
    ? Math.max(item.nextNotifyAt, now + 7 * DAY_MS)
    : item.nextNotifyAt;
}

function recordedDecision(item: Doc<"aiItems">, action: Decision) {
  if (action === "snooze") {
    return item.decision;
  }
  return action === "yes" || action === "no" ? action : undefined;
}

async function decide(
  ctx: MutationCtx,
  owner: string,
  item: Doc<"aiItems">,
  action: Decision,
  expectedVersion: number,
  snoozeUntil?: number
) {
  const now = Date.now();
  if (item.version !== expectedVersion) {
    aiError("This item changed. Review the current version before responding");
  }
  if (item.status === "done" || item.status === "dismissed") {
    aiError(
      "This item is already closed. Undo the last action before changing it"
    );
  }
  if (
    action === "snooze" &&
    (!snoozeUntil || snoozeUntil <= now || snoozeUntil > now + 30 * DAY_MS)
  ) {
    aiError("Choose a snooze time within the next 30 days");
  }
  const status = decisionStatus(item, action);
  const version = item.version + 1;
  const actionId = await ctx.db.insert("aiActions", {
    action,
    actorTokenIdentifier: owner,
    at: now,
    code: item.code,
    itemId: item._id,
    previous: previousState(item),
    resultVersion: version,
  });
  await ctx.db.patch("aiItems", item._id, {
    decision: recordedDecision(item, action),
    lastActionId: actionId,
    nextNotifyAt: decisionNotificationTime(item, status, now, snoozeUntil),
    ownership:
      action === "yes" && item.questionPurpose === "relevance"
        ? "confirmed"
        : item.ownership,
    resolutionReason: action,
    snoozedUntil: action === "snooze" ? snoozeUntil : undefined,
    status,
    userResolutionAt: now,
    version,
  });
  return { actionId, status, version };
}

export const respond = adminMutation
  .input({
    action: decisionAction,
    code: v.string(),
    expectedVersion: v.number(),
    receiptId: v.optional(v.id("aiReceipts")),
    snoozeUntil: v.optional(v.number()),
  })
  .handler(async (ctx, args) => {
    await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    const item = requireItemOwner(
      await ctx.db
        .query("aiItems")
        .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
        .unique(),
      ctx.identity.tokenIdentifier
    );
    if (args.receiptId) {
      const receipt = await ctx.db.get("aiReceipts", args.receiptId);
      const snapshot = receipt?.items.find(
        (entry) => entry.itemId === item._id
      );
      if (
        !receipt ||
        receipt.ownerTokenIdentifier !== ctx.identity.tokenIdentifier ||
        receipt.expiresAt <= Date.now() ||
        snapshot?.version !== args.expectedVersion
      ) {
        aiError(
          "This receipt is expired or changed. Open the current item to respond"
        );
      }
    }
    return await decide(
      ctx,
      ctx.identity.tokenIdentifier,
      item,
      args.action,
      args.expectedVersion,
      args.snoozeUntil
    );
  })
  .public();

async function undoAction(
  ctx: MutationCtx,
  owner: string,
  actionId: Id<"aiActions">
) {
  const action = await ctx.db.get("aiActions", actionId);
  if (
    !action ||
    action.actorTokenIdentifier !== owner ||
    action.undoneAt ||
    action.action === "undo"
  ) {
    aiError("Only your latest unchanged action can be undone");
  }
  const item = requireItemOwner(
    await ctx.db.get("aiItems", action.itemId),
    owner
  );
  if (item.lastActionId !== actionId || item.version !== action.resultVersion) {
    aiError("The item changed after this action; undo is no longer available");
  }
  const now = Date.now();
  const version = item.version + 1;
  const undoId = await ctx.db.insert("aiActions", {
    action: "undo",
    actorTokenIdentifier: owner,
    at: now,
    code: item.code,
    itemId: item._id,
    previous: previousState(item),
    resultVersion: version,
  });
  await ctx.db.patch("aiActions", actionId, { undoneAt: now });
  await ctx.db.patch("aiItems", item._id, {
    ...action.previous,
    lastActionId: undoId,
    version,
  });
  return { actionId: undoId, status: action.previous.status, version };
}

export const undo = adminMutation
  .input({ actionId: v.id("aiActions") })
  .handler(async (ctx, args) => {
    await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    return await undoAction(ctx, ctx.identity.tokenIdentifier, args.actionId);
  })
  .public();

function parseCommand(body: string) {
  const text = normalizeAiCommand(body);
  if (!isAiCommand(body)) {
    return null;
  }
  const tokens = text.split(/\s+/u);
  const codes = tokens.filter((token) => /^A[1-9]\d{0,9}$/u.test(token));
  const [code] = codes;
  const command = tokens.filter((token) => token !== code);
  const aliases: Record<string, Decision | "undo"> = {
    DONE: "done",
    IGNORE: "ignore",
    N: "no",
    NO: "no",
    NOT_MINE: "not_mine",
    SNOOZE: "snooze",
    UNDO: "undo",
    Y: "yes",
    YES: "yes",
  };
  const [name = "", delay] = command;
  const action = aliases[name];
  const snoozeMatch = delay?.match(/^(?<amount>\d{1,2})(?<unit>H|D)$/u);
  const units = snoozeMatch?.groups?.unit === "H" ? 3_600_000 : DAY_MS;
  const delayMs = snoozeMatch
    ? Number(snoozeMatch.groups?.amount) * units
    : DAY_MS;
  const validShape =
    Boolean(action) &&
    codes.length <= 1 &&
    command.length <= (action === "snooze" ? 2 : 1);
  const validDelay =
    (!delay || Boolean(snoozeMatch)) && delayMs > 0 && delayMs <= 30 * DAY_MS;
  return { action, code, delayMs, valid: validShape && validDelay };
}

type ParsedCommand = NonNullable<ReturnType<typeof parseCommand>>;

async function inferReplyCode(ctx: MutationCtx, settings: Doc<"aiSettings">) {
  const [sent, delivered] = await Promise.all(
    ["sent", "delivered"].map((status) =>
      ctx.db
        .query("aiSmsDeliveries")
        .withIndex("by_ownerTokenIdentifier_and_status", (q) =>
          q
            .eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
            .eq("status", status as "sent" | "delivered")
        )
        .order("desc")
        .take(50)
    )
  );
  if (!sent || !delivered || sent.length === 50 || delivered.length === 50) {
    return;
  }
  const pending = [...sent, ...delivered].filter(
    (entry) =>
      entry.question &&
      entry.expiresAt > Date.now() &&
      entry.phone === settings.phone
  );
  const [delivery] = pending;
  if (pending.length !== 1 || !delivery) {
    return;
  }
  const current = await ctx.db.get("aiItems", delivery.itemId);
  if (
    !current ||
    current.status !== "open" ||
    current.usefulUntil <= Date.now()
  ) {
    return;
  }
  return current.code === delivery.code &&
    current.version === delivery.itemVersion
    ? current.code
    : undefined;
}

const SMS_CONFLICT = {
  reply: "That action is no longer available. Review the current item at /ai.",
  status: "conflict",
};
const SMS_CLARIFICATION = {
  reply:
    "Include the item code, for example YES A12, DONE A12 or SNOOZE A12 1D. Review current items at /ai.",
  status: "clarification",
};

async function applySmsDecision(
  ctx: MutationCtx,
  owner: string,
  item: Doc<"aiItems">,
  action: Decision | "undo",
  delayMs: number
) {
  if (action === "undo") {
    const previous = item.lastActionId
      ? await ctx.db.get("aiActions", item.lastActionId)
      : null;
    if (!previous || previous.action === "undo" || previous.undoneAt) {
      return SMS_CONFLICT;
    }
    if (
      previous.resultVersion !== item.version ||
      previous.actorTokenIdentifier !== owner
    ) {
      return SMS_CONFLICT;
    }
    await undoAction(ctx, owner, previous._id);
    return {
      reply: `${item.code}: your last decision was undone.`,
      status: "updated",
    };
  }
  if (item.status === "done" || item.status === "dismissed") {
    return SMS_CONFLICT;
  }
  if ((action === "yes" || action === "no") && !item.question) {
    return SMS_CONFLICT;
  }
  await decide(
    ctx,
    owner,
    item,
    action,
    item.version,
    action === "snooze" ? Date.now() + delayMs : undefined
  );
  return {
    reply: `${item.code} updated. This records your decision only; it does not send, pay, cancel or change an external account.`,
    status: "updated",
  };
}

async function handleSmsCommand(
  ctx: MutationCtx,
  settings: Doc<"aiSettings">,
  command: ParsedCommand
) {
  if (!command.valid || !command.action) {
    return SMS_CLARIFICATION;
  }
  let { code } = command;
  if (!code && (command.action === "yes" || command.action === "no")) {
    // A competing stale delivery makes an unkeyed response ambiguous too.
    code = await inferReplyCode(ctx, settings);
  }
  if (!code) {
    return SMS_CLARIFICATION;
  }
  const item = await ctx.db
    .query("aiItems")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();
  if (!item || item.ownerTokenIdentifier !== settings.ownerTokenIdentifier) {
    return {
      reply:
        "That code is unavailable or changed. Review the current item at /ai.",
      status: "stale",
    };
  }
  if (item.usefulUntil <= Date.now()) {
    return {
      reply: "That item has expired. Review its current details at /ai.",
      status: "expired",
    };
  }
  return await applySmsDecision(
    ctx,
    settings.ownerTokenIdentifier,
    item,
    command.action,
    command.delayMs
  );
}

export const sms = convex
  .mutation()
  .input({
    body: v.string(),
    from: v.string(),
    messageSid: v.string(),
    secret: v.string(),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const command = parseCommand(args.body);
    if (!command) {
      return { handled: false as const, reply: "", status: "not-command" };
    }
    const settings = await getPrimarySettings(ctx);
    if (!settings?.phone || args.from !== settings.phone) {
      return {
        handled: true as const,
        reply: "",
        status: "unauthorized",
      };
    }
    boundedText(args.messageSid, "Message SID", 100);
    const existing = await ctx.db
      .query("aiSmsEvents")
      .withIndex("by_messageSid", (q) => q.eq("messageSid", args.messageSid))
      .unique();
    if (existing) {
      return {
        handled: true as const,
        reply: existing.reply,
        status: "duplicate",
      };
    }
    const result = await handleSmsCommand(ctx, settings, command);
    await ctx.db.insert("aiSmsEvents", {
      at: Date.now(),
      messageSid: args.messageSid,
      ownerTokenIdentifier: settings.ownerTokenIdentifier,
      ...result,
    });
    return { handled: true as const, ...result };
  })
  .public();
