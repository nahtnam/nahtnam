/* oxlint-disable sonarjs/no-undefined-assignment */
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  aiError,
  DAY_MS,
  isEligible,
  requirePrimarySettings,
} from "./ai-helpers";

// These helpers run in the same transaction as print-job state changes.
// Queue acceptance reserves an appearance; worker dispatch consumes it.
export async function recordReceiptDispatched(
  ctx: MutationCtx,
  receiptId: Id<"aiReceipts">,
  now: number
) {
  const receipt = await ctx.db.get("aiReceipts", receiptId);
  if (!receipt || receipt.dispatchedAt !== undefined) {
    return;
  }
  await Promise.all(
    receipt.items.map(async (snapshot) => {
      const item = await ctx.db.get("aiItems", snapshot.itemId);
      if (!item || item.pendingReceiptId !== receiptId) {
        return;
      }
      if (item.version !== snapshot.version) {
        await ctx.db.patch("aiItems", item._id, {
          pendingReceiptId: undefined,
        });
        return;
      }
      await ctx.db.patch("aiItems", item._id, {
        appearances: item.appearances + 1,
        lastNotifiedAt: now,
        lastNotifiedMilestone:
          item.priority === "urgent"
            ? item.urgentMilestone
            : item.lastNotifiedMilestone,
        nextNotifyAt: Math.max(item.nextNotifyAt, now + DAY_MS),
        pendingReceiptId: undefined,
        snoozedUntil: undefined,
        status: "open",
      });
    })
  );
  await ctx.db.patch("aiReceipts", receiptId, { dispatchedAt: now });
}

export async function releaseReceiptReservation(
  ctx: MutationCtx,
  receiptId: Id<"aiReceipts">
) {
  const receipt = await ctx.db.get("aiReceipts", receiptId);
  if (!receipt) {
    return;
  }
  await Promise.all(
    receipt.items.map(async (snapshot) => {
      const item = await ctx.db.get("aiItems", snapshot.itemId);
      if (item?.pendingReceiptId === receiptId) {
        await ctx.db.patch("aiItems", item._id, {
          pendingReceiptId: undefined,
        });
      }
    })
  );
}

export async function reserveReceiptForRetry(
  ctx: MutationCtx,
  receiptId: Id<"aiReceipts">,
  now: number
) {
  const settings = await requirePrimarySettings(ctx);
  const receipt = await ctx.db.get("aiReceipts", receiptId);
  if (
    !receipt ||
    receipt.ownerTokenIdentifier !== settings.ownerTokenIdentifier ||
    receipt.expiresAt <= now ||
    receipt.dispatchedAt !== undefined
  ) {
    aiError("This receipt is no longer available to retry");
  }
  if (!settings.paperEnabled) {
    aiError("Paper delivery is paused");
  }
  const items = await Promise.all(
    receipt.items.map((snapshot) => ctx.db.get("aiItems", snapshot.itemId))
  );
  for (const [index, item] of items.entries()) {
    const snapshot = receipt.items[index];
    if (
      !item ||
      !snapshot ||
      item.ownerTokenIdentifier !== settings.ownerTokenIdentifier
    ) {
      aiError("This receipt's items are no longer available");
    }
    if (
      item.code !== snapshot.code ||
      item.version !== snapshot.version ||
      !isEligible(item, settings, now)
    ) {
      aiError("This receipt changed or is no longer eligible");
    }
  }
  await Promise.all(
    receipt.items.map((snapshot) =>
      ctx.db.patch("aiItems", snapshot.itemId, { pendingReceiptId: receiptId })
    )
  );
}

export async function releaseUnavailableReservations(
  ctx: MutationCtx,
  items: Doc<"aiItems">[],
  now: number
) {
  const ids = new Set(
    items.flatMap((item) =>
      item.pendingReceiptId ? [item.pendingReceiptId] : []
    )
  );
  await Promise.all(
    [...ids].map(async (receiptId) => {
      const receipt = await ctx.db.get("aiReceipts", receiptId);
      if (!receipt) {
        return;
      }
      const job = receipt.printJobId
        ? await ctx.db.get("printJobs", receipt.printJobId)
        : null;
      // A worker may already have sent bytes. Wait for its result before releasing.
      if (job?.status === "printing") {
        return;
      }
      const unavailable =
        !job || ["cancelled", "expired", "failed"].includes(job.status);
      if (unavailable || receipt.expiresAt <= now) {
        await releaseReceiptReservation(ctx, receiptId);
      }
    })
  );
}
