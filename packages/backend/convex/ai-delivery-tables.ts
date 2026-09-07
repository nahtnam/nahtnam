import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiDeliveryTables = {
  aiSmsDeliveries: defineTable({
    code: v.string(),
    expiresAt: v.number(),
    idempotencyKey: v.string(),
    itemId: v.id("aiItems"),
    itemVersion: v.number(),
    milestone: v.string(),
    ownerTokenIdentifier: v.string(),
    phone: v.string(),
    providerId: v.optional(v.string()),
    question: v.boolean(),
    status: v.union(
      v.literal("reserved"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("unknown")
    ),
    updatedAt: v.number(),
  })
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_ownerTokenIdentifier_and_status", [
      "ownerTokenIdentifier",
      "status",
    ])
    .index("by_itemId_and_itemVersion", ["itemId", "itemVersion"])
    .index("by_itemId_and_milestone", ["itemId", "milestone"])
    .index("by_ownerTokenIdentifier_and_updatedAt", [
      "ownerTokenIdentifier",
      "updatedAt",
    ]),
};
