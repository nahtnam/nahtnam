/* oxlint-disable sonarjs/no-undefined-assignment */
import type { Infer } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { aiError, DAY_MS, requireItemOwner } from "./ai_helpers";
import type { decisionAction } from "./ai_tables";

export type Decision = Infer<typeof decisionAction>;

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

export async function decide(options: {
  ctx: MutationCtx;
  owner: string;
  item: Doc<"aiItems">;
  action: Decision;
  expectedVersion: number;
  snoozeUntil?: number;
}) {
  const { ctx, owner, item, action, expectedVersion, snoozeUntil } = options;
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

export async function undoAction(options: {
  ctx: MutationCtx;
  owner: string;
  actionId: Id<"aiActions">;
}) {
  const { ctx, owner, actionId } = options;
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
