import { v } from "convex/values";
import type { Infer } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { decide } from "./ai-decisions";
import type { Decision } from "./ai-decisions";
import {
  aiError,
  boundedText,
  requireItemOwner,
  requirePrimarySettings,
  timestamp,
} from "./ai-helpers";

export const replyFields = {
  body: v.string(),
  code: v.optional(v.string()),
  expectedVersion: v.optional(v.number()),
  idempotencyKey: v.string(),
  receiptId: v.optional(v.id("aiReceipts")),
};
const replyValidator = v.object(replyFields);
type ReplyInput = Infer<typeof replyValidator>;

function validateReply(options: ReplyInput) {
  const { body, idempotencyKey, code, expectedVersion } = options;
  if (expectedVersion !== undefined) {
    timestamp(expectedVersion, "Observed item version");
    if (!code) {
      aiError("An observed version requires an item code");
    }
  }
  if (!body.trim() || body.length > 4000) {
    aiError("Replies must contain 1-4000 characters");
  }
  boundedText(idempotencyKey, "Reply idempotency key", 160);
}

// Raw replies are an inbox for later interpretation, never executable commands.
export async function storeReply(
  options: ReplyInput & {
    ctx: MutationCtx;
    owner: string;
    source: "sms" | "web";
    senderPhone?: string;
  }
) {
  const {
    ctx,
    owner,
    source,
    body,
    idempotencyKey,
    code,
    receiptId,
    expectedVersion,
    senderPhone,
  } = options;
  validateReply(options);
  const itemCode = code?.toUpperCase();
  const existing = await ctx.db
    .query("aiReplies")
    .withIndex("by_ownerTokenIdentifier_and_source_and_idempotencyKey", (q) =>
      q
        .eq("ownerTokenIdentifier", owner)
        .eq("source", source)
        .eq("idempotencyKey", idempotencyKey)
    )
    .unique();
  if (existing) {
    const sameContext =
      existing.itemCode === itemCode && existing.receiptId === receiptId;
    const sameVersion =
      expectedVersion === undefined || existing.itemVersion === expectedVersion;
    if (existing.body !== body || !sameContext || !sameVersion) {
      aiError(
        "This reply idempotency key was already used for different content"
      );
    }
    return { duplicate: true, replyId: existing._id };
  }
  const item = itemCode
    ? requireItemOwner(
        await ctx.db
          .query("aiItems")
          .withIndex("by_code", (q) => q.eq("code", itemCode))
          .unique(),
        owner
      )
    : null;
  if (receiptId) {
    const receipt = await ctx.db.get("aiReceipts", receiptId);
    if (!receipt || receipt.ownerTokenIdentifier !== owner) {
      aiError("Receipt unavailable");
    }
    if (item && !receipt.items.some((entry) => entry.itemId === item._id)) {
      aiError("This item is not part of that receipt");
    }
  }
  const replyId = await ctx.db.insert("aiReplies", {
    body,
    createdAt: Date.now(),
    idempotencyKey,
    itemCode,
    itemSource: item?.source,
    itemVersion: expectedVersion ?? item?.version,
    ownerTokenIdentifier: owner,
    receiptId,
    senderPhone,
    source,
    status: "pending",
  });
  return { duplicate: false, replyId };
}

export async function receiveSms(options: {
  ctx: MutationCtx;
  args: { body: string; from: string; messageSid: string };
}) {
  const { ctx, args } = options;
  const settings = await requirePrimarySettings(ctx);
  boundedText(args.messageSid, "Message SID", 100);
  // Retries keep their original identity and context even after the user
  // changes the allowlisted phone or the item receives a new code.
  const previous = await ctx.db
    .query("aiReplies")
    .withIndex("by_ownerTokenIdentifier_and_source_and_idempotencyKey", (q) =>
      q
        .eq("ownerTokenIdentifier", settings.ownerTokenIdentifier)
        .eq("source", "sms")
        .eq("idempotencyKey", args.messageSid)
    )
    .unique();
  if (previous) {
    if (previous.body !== args.body || previous.senderPhone !== args.from) {
      aiError(
        "This SMS message ID was already used for different content or sender"
      );
    }
    return smsReplyResult({ duplicate: true, replyId: previous._id });
  }
  if (!settings.phone) {
    aiError("Configure the owner phone before accepting SMS replies");
  }
  if (args.from !== settings.phone) {
    return { handled: false as const, reply: "", status: "unauthorized" };
  }
  // Only an explicit leading code supplies context. Unknown codes remain raw
  // inbox text so stale paper or a typo never discards the owner's response.
  const code = args.body
    .trimStart()
    .match(/^(?<code>A[1-9]\d{0,9})\b/iu)
    ?.groups?.code?.toUpperCase();
  const item = code
    ? await ctx.db
        .query("aiItems")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique()
    : null;
  const stored = await storeReply({
    body: args.body,
    code:
      item?.ownerTokenIdentifier === settings.ownerTokenIdentifier
        ? item.code
        : undefined,
    ctx,
    idempotencyKey: args.messageSid,
    owner: settings.ownerTokenIdentifier,
    senderPhone: args.from,
    source: "sms",
  });
  return smsReplyResult(stored);
}

function smsReplyResult(options: {
  replyId: Id<"aiReplies">;
  duplicate: boolean;
}) {
  const { replyId, duplicate } = options;
  return {
    handled: true as const,
    reply: "Saved. Your automation will read this on its next run.",
    replyId,
    status: duplicate ? "duplicate" : "queued",
  };
}

export async function loadPendingReplies(options: {
  ctx: Pick<QueryCtx, "db">;
  owner: string;
  cursor?: string;
}) {
  const { ctx, owner, cursor } = options;
  const page = await ctx.db
    .query("aiReplies")
    .withIndex("by_ownerTokenIdentifier_and_status_and_createdAt", (q) =>
      q.eq("ownerTokenIdentifier", owner).eq("status", "pending")
    )
    .paginate({ cursor: cursor ?? null, numItems: 100 });
  return {
    nextReplyCursor: page.isDone ? null : page.continueCursor,
    replies: page.page,
    repliesTruncated: !page.isDone,
  };
}

async function requireOwnedReply(options: {
  ctx: MutationCtx;
  replyId: Id<"aiReplies">;
}) {
  const { ctx, replyId } = options;
  const settings = await requirePrimarySettings(ctx);
  const reply = await ctx.db.get("aiReplies", replyId);
  if (!reply || reply.ownerTokenIdentifier !== settings.ownerTokenIdentifier) {
    aiError("Reply unavailable");
  }
  return reply;
}

export async function applyStoredReplyDecision(options: {
  ctx: MutationCtx;
  replyId: Id<"aiReplies">;
  code: string;
  expectedVersion: number;
  action: Decision;
  snoozeUntil?: number;
}) {
  const { ctx, replyId, code, expectedVersion, action, snoozeUntil } = options;
  const reply = await requireOwnedReply({ ctx, replyId });
  if (reply.status !== "pending") {
    aiError("This reply has already been processed");
  }
  const item = requireItemOwner(
    await ctx.db
      .query("aiItems")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .unique(),
    reply.ownerTokenIdentifier
  );
  // A contextual reply refers to the version that was visible when submitted.
  if (
    reply.itemCode &&
    (reply.itemCode !== item.code || reply.itemVersion !== expectedVersion)
  ) {
    aiError("The reply refers to a different item version; review its context");
  }
  if (reply.receiptId) {
    const receipt = await ctx.db.get("aiReceipts", reply.receiptId);
    const snapshot = receipt?.items.find((entry) => entry.itemId === item._id);
    if (snapshot?.version !== expectedVersion) {
      aiError("The reply's receipt refers to a different item version");
    }
  }
  const previous = await ctx.db
    .query("aiActions")
    .withIndex("by_replyId_and_itemId", (q) =>
      q.eq("replyId", replyId).eq("itemId", item._id)
    )
    .unique();
  if (previous) {
    if (
      previous.action !== action ||
      previous.resultVersion !== expectedVersion + 1 ||
      previous.replySnoozeUntil !== snoozeUntil
    ) {
      aiError("This reply already recorded a different decision for that item");
    }
    return {
      actionId: previous._id,
      duplicate: true,
      version: previous.resultVersion,
    };
  }
  const result = await decide({
    action,
    ctx,
    expectedVersion,
    item,
    owner: reply.ownerTokenIdentifier,
    snoozeUntil,
  });
  await ctx.db.patch("aiActions", result.actionId, {
    replyId,
    replySnoozeUntil: snoozeUntil,
  });
  return { ...result, duplicate: false };
}

export async function acknowledgeStoredReply(options: {
  ctx: MutationCtx;
  replyId: Id<"aiReplies">;
  result: string;
}) {
  const { ctx, replyId, result } = options;
  boundedText(result, "Processing result", 1000);
  const reply = await requireOwnedReply({ ctx, replyId });
  if (reply.status === "processed") {
    if (reply.result !== result) {
      aiError("This reply was already acknowledged with a different result");
    }
    return { duplicate: true, processed: true, replyId };
  }
  await ctx.db.patch("aiReplies", replyId, {
    processedAt: Date.now(),
    result,
    status: "processed",
  });
  return { duplicate: false, processed: true, replyId };
}
