/* oxlint-disable sonarjs/no-undefined-assignment */
import { v } from "convex/values";

import { decide, undoAction } from "./ai_decisions";
import { loadOperationalHealth } from "./ai_health";
import {
  aiError,
  boundedText,
  isPending,
  loadActiveItems,
  loadOwnerHistory,
  ownerSettings,
  publicSettings,
  requireItemOwner,
  requirePrimarySettings,
  timestamp,
} from "./ai_helpers";
import { candidateValidator, ingestItems } from "./ai_ingestion";
import { publishFields, publishReceipt } from "./ai_publishing";
import {
  receiveSms,
  storeReply,
  loadPendingReplies,
  acknowledgeStoredReply,
  applyStoredReplyDecision,
  replyFields,
} from "./ai_replies";
import { decisionAction } from "./ai_tables";
import { adminMutation, adminQuery, convex } from "./fluent";
import { requireAiSecret } from "./lib/secrets";

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
  .input({
    limit: v.optional(v.number()),
    now: v.number(),
    view: viewValidator,
  })
  .handler(async (ctx, args) => {
    const settings = await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    if (!settings) {
      return [];
    }
    const { now } = args;
    timestamp(now, "View time");
    const items =
      args.view === "history"
        ? await loadOwnerHistory(ctx, settings.ownerTokenIdentifier, 200, now)
        : await loadActiveItems(ctx, settings.ownerTokenIdentifier, now);
    const matching = items.filter((item) => {
      if (args.view === "history") {
        return true;
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
      return isPending(item, now) && item.nextNotifyAt > now;
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
    const operations = await loadOperationalHealth({
      ctx,
      now: Date.now(),
      owner: settings.ownerTokenIdentifier,
    });
    return {
      ...operations,
      configured: true,
      settings: {
        paperEnabled: settings.paperEnabled,
        phoneConfigured: Boolean(settings.phone),
      },
    };
  })
  .public();

export const ingest = convex
  .mutation()
  .input({ items: v.array(candidateValidator), secret: v.string() })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    return await ingestItems({ ctx, items: args.items });
  })
  .public();

export const machineSnapshot = convex
  .query()
  .input({
    replyCursor: v.optional(v.string()),
    secret: v.string(),
    source: v.optional(v.string()),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const settings = await requirePrimarySettings(ctx);
    const { source } = args;
    const now = Date.now();
    const feedback = await loadPendingReplies({
      ctx,
      cursor: args.replyCursor,
      owner: settings.ownerTokenIdentifier,
    });
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
        ...feedback,
        coverage: "source-bounded" as const,
        items: rows.slice(0, 500),
        settings: settingsView,
        truncated: rows.length > 500,
      };
    }
    const [active, history, operations] = await Promise.all([
      loadActiveItems(ctx, settings.ownerTokenIdentifier, now),
      loadOwnerHistory(ctx, settings.ownerTokenIdentifier, 200, now),
      loadOperationalHealth({ ctx, now, owner: settings.ownerTokenIdentifier }),
    ]);
    return {
      ...feedback,
      ...operations,
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

export const publish = convex
  .mutation()
  .input({ ...publishFields, secret: v.string() })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    return await publishReceipt({ args, ctx });
  })
  .public();

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
    return await decide({
      action: args.action,
      ctx,
      expectedVersion: args.expectedVersion,
      item,
      owner: ctx.identity.tokenIdentifier,
      snoozeUntil: args.snoozeUntil,
    });
  })
  .public();

export const undo = adminMutation
  .input({ actionId: v.id("aiActions") })
  .handler(async (ctx, args) => {
    await ownerSettings(ctx, ctx.identity.tokenIdentifier);
    return await undoAction({
      actionId: args.actionId,
      ctx,
      owner: ctx.identity.tokenIdentifier,
    });
  })
  .public();

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
    return await receiveSms({ args, ctx });
  })
  .public();

export const submitFeedback = adminMutation
  .input(replyFields)
  .handler(async (ctx, args) => {
    const settings = await requirePrimarySettings(ctx);
    if (settings.ownerTokenIdentifier !== ctx.identity.tokenIdentifier) {
      aiError("Action center owner access required");
    }
    return await storeReply({
      ctx,
      owner: ctx.identity.tokenIdentifier,
      source: "web",
      ...args,
    });
  })
  .public();

export const applyReplyDecision = convex
  .mutation()
  .input({
    action: decisionAction,
    code: v.string(),
    expectedVersion: v.number(),
    replyId: v.id("aiReplies"),
    secret: v.string(),
    snoozeUntil: v.optional(v.number()),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    return await applyStoredReplyDecision({ ctx, ...args });
  })
  .public();

export const acknowledgeReply = convex
  .mutation()
  .input({ replyId: v.id("aiReplies"), result: v.string(), secret: v.string() })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    return await acknowledgeStoredReply({ ctx, ...args });
  })
  .public();
