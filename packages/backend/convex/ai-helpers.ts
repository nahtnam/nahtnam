import { ConvexError } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

export const DAY_MS = 86_400_000;
export const MAX_ITEMS = 500;

export function aiError(message: string): never {
  throw new ConvexError({ code: "AI_ACTION_ERROR", message });
}

export function getPrimarySettings(ctx: Pick<QueryCtx, "db">) {
  return ctx.db
    .query("aiSettings")
    .withIndex("by_singleton", (q) => q.eq("singleton", "primary"))
    .unique();
}

export async function requirePrimarySettings(ctx: Pick<QueryCtx, "db">) {
  const settings = await getPrimarySettings(ctx);
  if (!settings) {
    aiError(
      "Initialize the action center from its authenticated settings page first"
    );
  }
  return settings;
}

export async function ownerSettings(
  ctx: Pick<QueryCtx, "db">,
  tokenIdentifier: string
) {
  const settings = await getPrimarySettings(ctx);
  if (settings && settings.ownerTokenIdentifier !== tokenIdentifier) {
    aiError("Action center owner access required");
  }
  return settings;
}

export function requireItemOwner(item: Doc<"aiItems"> | null, owner: string) {
  if (!item || item.ownerTokenIdentifier !== owner) {
    aiError("Item unavailable");
  }
  return item;
}

export function boundedText(value: string, label: string, max: number) {
  const containsControl = [...value].some((character) => {
    const point = character.codePointAt(0) ?? 0;
    return point < 9 || (point > 10 && point < 32) || point === 127;
  });
  if (!value.trim() || value.length > max || containsControl) {
    aiError(
      `${label} must contain 1-${max} characters without control characters`
    );
  }
}

export function timestamp(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    aiError(`${label} must be an epoch timestamp in milliseconds`);
  }
}

export function isPending(item: Doc<"aiItems">, now: number) {
  return (
    item.status === "open" ||
    (item.status === "snoozed" && (item.snoozedUntil ?? Infinity) <= now)
  );
}

export function isEligible(
  item: Doc<"aiItems">,
  settings: Doc<"aiSettings">,
  now: number
) {
  const relevanceQuestion =
    item.kind === "question" && item.questionPurpose === "relevance";
  if (!isPending(item, now) || item.pendingReceiptId) {
    return false;
  }
  if (item.ownership !== "confirmed" && !relevanceQuestion) {
    return false;
  }
  if (
    item.usefulUntil <= now ||
    item.evidenceAt > now ||
    item.nextNotifyAt > now
  ) {
    return false;
  }
  if (settings.pausedSources.includes(item.source)) {
    return false;
  }
  // An explicit user snooze grants one reminder at its chosen time, even
  // when the ordinary repeat budget or a prior answer suppresses this item.
  // Worker dispatch clears snoozed status, consuming that one-time grant.
  if (item.status === "snoozed") {
    return true;
  }
  if (item.decision && item.userResolutionAt !== undefined) {
    return false;
  }
  if (relevanceQuestion) {
    return item.appearances < 1;
  }
  if (item.priority === "urgent") {
    return (
      Boolean(item.urgentMilestone) &&
      item.lastNotifiedMilestone !== item.urgentMilestone
    );
  }
  return item.appearances < 2;
}

export function publicSettings(settings: Doc<"aiSettings">) {
  return {
    configured: true as const,
    paperEnabled: settings.paperEnabled,
    pausedSources: settings.pausedSources,
    phone: settings.phone,
  };
}

export async function loadActiveItems(
  ctx: Pick<QueryCtx, "db">,
  owner: string,
  now: number
) {
  const [open, snoozed] = await Promise.all([
    ctx.db
      .query("aiItems")
      .withIndex("by_ownerTokenIdentifier_and_status_and_usefulUntil", (q) =>
        q
          .eq("ownerTokenIdentifier", owner)
          .eq("status", "open")
          .gt("usefulUntil", now)
      )
      .take(MAX_ITEMS + 1),
    ctx.db
      .query("aiItems")
      .withIndex("by_ownerTokenIdentifier_and_status_and_usefulUntil", (q) =>
        q
          .eq("ownerTokenIdentifier", owner)
          .eq("status", "snoozed")
          .gt("usefulUntil", now)
      )
      .take(MAX_ITEMS + 1),
  ]);
  const active = [...open, ...snoozed];
  if (active.length > MAX_ITEMS) {
    aiError(
      "Action center has more than 500 active items. Reconcile the backlog before publishing; coverage would be incomplete"
    );
  }
  return active;
}

export async function loadOwnerHistory(
  ctx: Pick<QueryCtx, "db">,
  owner: string,
  limit: number,
  now: number
) {
  const [done, dismissed, expiredOpen, expiredSnoozed] = await Promise.all([
    ctx.db
      .query("aiItems")
      .withIndex("by_ownerTokenIdentifier_and_status_and_nextNotifyAt", (q) =>
        q.eq("ownerTokenIdentifier", owner).eq("status", "done")
      )
      .order("desc")
      .take(limit),
    ctx.db
      .query("aiItems")
      .withIndex("by_ownerTokenIdentifier_and_status_and_nextNotifyAt", (q) =>
        q.eq("ownerTokenIdentifier", owner).eq("status", "dismissed")
      )
      .order("desc")
      .take(limit),
    ctx.db
      .query("aiItems")
      .withIndex("by_ownerTokenIdentifier_and_status_and_usefulUntil", (q) =>
        q
          .eq("ownerTokenIdentifier", owner)
          .eq("status", "open")
          .lte("usefulUntil", now)
      )
      .order("desc")
      .take(limit),
    ctx.db
      .query("aiItems")
      .withIndex("by_ownerTokenIdentifier_and_status_and_usefulUntil", (q) =>
        q
          .eq("ownerTokenIdentifier", owner)
          .eq("status", "snoozed")
          .lte("usefulUntil", now)
      )
      .order("desc")
      .take(limit),
  ]);
  return [...done, ...dismissed, ...expiredOpen, ...expiredSnoozed]
    .toSorted((a, b) => b._creationTime - a._creationTime)
    .slice(0, limit);
}
