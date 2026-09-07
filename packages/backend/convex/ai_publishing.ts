import { v } from "convex/values";
import type { Infer } from "convex/values";

import type { MutationCtx } from "./_generated/server";
import {
  aiError,
  boundedText,
  DAY_MS,
  isEligible,
  loadActiveItems,
  requirePrimarySettings,
  timestamp,
} from "./ai_helpers";
import { releaseUnavailableReservations } from "./ai_receipt_delivery";
import { createPrintJob } from "./print_jobs";

export const publishFields = {
  expiresAt: v.optional(v.number()),
  idempotencyKey: v.string(),
  mode: v.optional(
    v.union(v.literal("actions"), v.literal("brief"), v.literal("timed"))
  ),
  source: v.optional(v.string()),
  title: v.optional(v.string()),
};
const publishValidator = v.object(publishFields);
type PublishInput = Infer<typeof publishValidator>;

function receiptLine(value: string, max: number) {
  return value
    .normalize("NFKD")
    .replaceAll(/[^\u0020-\u007E]/gu, " ")
    .replaceAll(/\s+/gu, " ")
    .trim()
    .slice(0, max);
}

export async function publishReceipt(options: {
  ctx: MutationCtx;
  args: PublishInput;
}) {
  const { ctx, args } = options;
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
    settings.ownerTokenIdentifier,
    now
  );
  await releaseUnavailableReservations(ctx, activeItems, now);
  const ownerItems = await loadActiveItems(
    ctx,
    settings.ownerTokenIdentifier,
    now
  );
  const eligibleItems = ownerItems
    .filter((item) => {
      const matchingSource = !args.source || args.source === item.source;
      return isEligible(item, settings, now) && matchingSource;
    })
    .toSorted(
      (a, b) =>
        Number(b.priority === "urgent") - Number(a.priority === "urgent") ||
        (a.dueAt ?? a.usefulUntil) - (b.dueAt ?? b.usefulUntil)
    );
  const items = eligibleItems
    .filter((item) =>
      args.mode === "timed" ? item.kind === "info" : item.kind !== "info"
    )
    .slice(0, 3);
  if (args.mode === "brief") {
    items.push(
      ...eligibleItems
        .filter(
          (item) => item.kind === "info" && item.source === "calendar-agenda"
        )
        .slice(0, 5)
    );
  }
  if (items.length === 0) {
    return { count: 0, receiptId: null, status: "empty" as const };
  }
  const expiresAt = Math.min(
    requestedExpiry,
    ...items.map((item) => item.usefulUntil)
  );
  const defaultTitles = {
    actions: "TODAY'S ACTIONS",
    brief: "TODAY",
    timed: "UP NEXT",
  };
  const title = args.title ?? defaultTitles[args.mode ?? "actions"];
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
}
