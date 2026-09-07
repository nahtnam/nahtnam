import type { QueryCtx } from "./_generated/server";
import { DAY_MS } from "./ai_helpers";

// Call only after machine-secret or administrator/owner authorization.
export async function loadOperationalHealth(options: {
  ctx: Pick<QueryCtx, "db">;
  owner: string;
  now: number;
}) {
  const { ctx, owner, now } = options;
  const [sources, receipts, deliveries] = await Promise.all([
    ctx.db
      .query("aiHealth")
      .withIndex("by_ownerTokenIdentifier_and_source", (q) =>
        q.eq("ownerTokenIdentifier", owner)
      )
      .take(51),
    ctx.db
      .query("aiReceipts")
      .withIndex("by_ownerTokenIdentifier_and_createdAt", (q) =>
        q.eq("ownerTokenIdentifier", owner)
      )
      .order("desc")
      .take(21),
    ctx.db
      .query("aiSmsDeliveries")
      .withIndex("by_ownerTokenIdentifier_and_updatedAt", (q) =>
        q.eq("ownerTokenIdentifier", owner)
      )
      .order("desc")
      .take(21),
  ]);
  const receiptStatuses = await Promise.all(
    receipts.slice(0, 20).map(async (receipt) => {
      const job = receipt.printJobId
        ? await ctx.db.get("printJobs", receipt.printJobId)
        : null;
      return {
        ...receipt,
        expired: receipt.expiresAt <= now,
        printError: job?.printState.lastError,
        printStatus: job?.status ?? "missing",
      };
    })
  );
  return {
    deliveries: deliveries.slice(0, 20).map((delivery) => ({
      _id: delivery._id,
      code: delivery.code,
      expiresAt: delivery.expiresAt,
      idempotencyKey: delivery.idempotencyKey,
      itemId: delivery.itemId,
      itemVersion: delivery.itemVersion,
      milestone: delivery.milestone,
      providerId: delivery.providerId,
      status: delivery.status,
      updatedAt: delivery.updatedAt,
    })),
    operationsTruncated: {
      deliveries: deliveries.length > 20,
      receipts: receipts.length > 20,
      sources: sources.length > 50,
    },
    receipts: receiptStatuses,
    sources: sources.slice(0, 50).map((source) => ({
      ...source,
      stale: now - source.checkedAt > DAY_MS,
    })),
  };
}
