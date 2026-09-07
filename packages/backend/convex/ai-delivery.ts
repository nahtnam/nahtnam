import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { convex } from "./fluent";
import { requireAiSecret } from "./lib/secrets";

const DAY_MS = 86_400_000;

// Reserve before calling the SMS provider. An ambiguous send is never retried
// automatically: provider acceptance can precede a lost HTTP response.
export const reserve = convex
  .mutation()
  .input({
    code: v.string(),
    expectedVersion: v.number(),
    idempotencyKey: v.string(),
    secret: v.string(),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    if (!args.idempotencyKey || args.idempotencyKey.length > 200) {
      throw new ConvexError("A stable idempotency key is required.");
    }
    const settings = await ctx.db
      .query("aiSettings")
      .withIndex("by_singleton", (query) => query.eq("singleton", "primary"))
      .unique();
    if (!settings?.phone) {
      throw new ConvexError("Configure your personal phone in /ai first.");
    }
    const existing = await ctx.db
      .query("aiSmsDeliveries")
      .withIndex("by_idempotencyKey", (query) =>
        query.eq("idempotencyKey", args.idempotencyKey)
      )
      .unique();
    if (existing) {
      return {
        id: existing._id,
        send: false as const,
        status: existing.status,
      };
    }
    const candidate = await ctx.db
      .query("aiItems")
      .withIndex("by_code", (query) => query.eq("code", args.code))
      .unique();
    const now = Date.now();
    const { item, milestone } = requireUrgentItem({
      expectedVersion: args.expectedVersion,
      item: candidate,
      now,
      settings,
    });
    const previous = await ctx.db
      .query("aiSmsDeliveries")
      .withIndex("by_itemId_and_milestone", (query) =>
        query.eq("itemId", item._id).eq("milestone", milestone)
      )
      .first();
    if (previous) {
      return {
        id: previous._id,
        send: false as const,
        status: previous.status,
      };
    }
    const recent = await ctx.db
      .query("aiSmsDeliveries")
      .withIndex("by_ownerTokenIdentifier_and_updatedAt", (query) =>
        query
          .eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
          .gte("updatedAt", now - DAY_MS)
      )
      .take(3);
    if (recent.length >= 3) {
      throw new ConvexError(
        "Urgent SMS limit reached. Review /ai before sending more."
      );
    }
    const id = await ctx.db.insert("aiSmsDeliveries", {
      code: item.code,
      expiresAt: Math.min(item.usefulUntil, now + 12 * 3_600_000),
      idempotencyKey: args.idempotencyKey,
      itemId: item._id,
      itemVersion: item.version,
      milestone,
      ownerTokenIdentifier: settings.ownerTokenIdentifier,
      phone: settings.phone,
      question: item.kind === "question",
      status: "reserved",
      updatedAt: now,
    });
    const responseHint = item.question
      ? `${item.code} Y: ${item.question.yesLabel}; ${item.code} N: ${item.question.noLabel}`
      : `${item.code} DONE or ${item.code} SNOOZE 1D`;
    return {
      body: `Urgent: ${item.title}\n${item.whyNow}\n${responseHint}`,
      code: item.code,
      id,
      phone: settings.phone,
      send: true as const,
      status: "reserved" as const,
    };
  })
  .public();

export const settle = convex
  .mutation()
  .input({
    id: v.id("aiSmsDeliveries"),
    providerId: v.optional(v.string()),
    secret: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("unknown")
    ),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const delivery = await ctx.db.get("aiSmsDeliveries", args.id);
    if (!delivery) {
      throw new ConvexError("Delivery not found.");
    }
    if (delivery.status !== "reserved") {
      return { status: delivery.status };
    }
    await ctx.db.patch("aiSmsDeliveries", args.id, {
      ...(args.providerId ? { providerId: args.providerId } : {}),
      status: args.status,
      updatedAt: Date.now(),
    });
    return { status: args.status };
  })
  .public();

export const recordStatus = convex
  .mutation()
  .input({
    id: v.id("aiSmsDeliveries"),
    providerId: v.string(),
    secret: v.string(),
    status: v.union(v.literal("delivered"), v.literal("failed")),
  })
  .handler(async (ctx, args) => {
    requireAiSecret(args.secret);
    const delivery = await ctx.db.get("aiSmsDeliveries", args.id);
    if (
      !delivery ||
      (delivery.providerId && delivery.providerId !== args.providerId)
    ) {
      throw new ConvexError("Delivery does not match provider message.");
    }
    if (delivery.status === "delivered") {
      return { status: delivery.status };
    }
    await ctx.db.patch("aiSmsDeliveries", args.id, {
      providerId: args.providerId,
      status: args.status,
      updatedAt: Date.now(),
    });
    return { status: args.status };
  })
  .public();

function requireUrgentItem(options: {
  item: Doc<"aiItems"> | null;
  settings: Doc<"aiSettings">;
  expectedVersion: number;
  now: number;
}) {
  const { item, settings, expectedVersion, now } = options;
  const message = "Only a current, actionable urgent item can be texted.";
  if (!item || !item.urgentMilestone) {
    throw new ConvexError(message);
  }
  const conditions = [
    item.ownerTokenIdentifier === settings.ownerTokenIdentifier,
    item.version === expectedVersion,
    item.status === "open",
    item.priority === "urgent",
    item.ownership === "confirmed",
    item.usefulUntil > now,
    !(item.decision && item.userResolutionAt !== undefined),
    !settings.pausedSources.includes(item.source),
  ];
  const recentPaper =
    item.lastNotifiedMilestone === item.urgentMilestone &&
    (item.lastNotifiedAt ?? 0) >= now - 3_600_000;
  if (!conditions.every(Boolean) || (item.nextNotifyAt > now && !recentPaper)) {
    throw new ConvexError(message);
  }
  return { item, milestone: item.urgentMilestone };
}
