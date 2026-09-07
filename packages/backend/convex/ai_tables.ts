import { defineTable } from "convex/server";
import { v } from "convex/values";

export const itemStatus = v.union(
  v.literal("open"),
  v.literal("snoozed"),
  v.literal("done"),
  v.literal("dismissed")
);
export const decisionAction = v.union(
  v.literal("done"),
  v.literal("snooze"),
  v.literal("ignore"),
  v.literal("not_mine"),
  v.literal("yes"),
  v.literal("no")
);
export const questionValidator = v.object({
  noLabel: v.string(),
  noOutcome: v.union(
    v.literal("done"),
    v.literal("dismissed"),
    v.literal("open")
  ),
  yesLabel: v.string(),
  yesOutcome: v.union(
    v.literal("done"),
    v.literal("dismissed"),
    v.literal("open")
  ),
});
export const candidateFields = {
  checkedAt: v.number(),
  dueAt: v.optional(v.number()),
  evidenceAt: v.number(),
  kind: v.union(v.literal("task"), v.literal("question"), v.literal("info")),
  nextNotifyAt: v.number(),
  ownership: v.union(v.literal("confirmed"), v.literal("unknown")),
  priority: v.union(v.literal("routine"), v.literal("urgent")),
  question: v.optional(questionValidator),
  questionPurpose: v.optional(v.literal("relevance")),
  source: v.string(),
  sourceKey: v.string(),
  sourceUrl: v.optional(v.string()),
  title: v.string(),
  urgentMilestone: v.optional(v.string()),
  usefulUntil: v.number(),
  whyNow: v.string(),
};
const previousState = v.object({
  appearances: v.number(),
  decision: v.optional(v.union(v.literal("yes"), v.literal("no"))),
  nextNotifyAt: v.number(),
  ownership: v.union(v.literal("confirmed"), v.literal("unknown")),
  resolutionReason: v.optional(v.string()),
  snoozedUntil: v.optional(v.number()),
  status: itemStatus,
  userResolutionAt: v.optional(v.number()),
});

export const aiTables = {
  aiActions: defineTable({
    action: v.union(decisionAction, v.literal("undo")),
    actorTokenIdentifier: v.string(),
    at: v.number(),
    code: v.string(),
    itemId: v.id("aiItems"),
    previous: previousState,
    replyId: v.optional(v.id("aiReplies")),
    replySnoozeUntil: v.optional(v.number()),
    resultVersion: v.number(),
    undoneAt: v.optional(v.number()),
  })
    .index("by_itemId_and_at", ["itemId", "at"])
    .index("by_replyId_and_itemId", ["replyId", "itemId"])
    .index("by_actorTokenIdentifier_and_at", ["actorTokenIdentifier", "at"]),

  aiHealth: defineTable({
    checkedAt: v.number(),
    coverageThrough: v.optional(v.number()),
    message: v.optional(v.string()),
    ownerTokenIdentifier: v.string(),
    source: v.string(),
    status: v.union(
      v.literal("ok"),
      v.literal("partial"),
      v.literal("blocked")
    ),
  }).index("by_ownerTokenIdentifier_and_source", [
    "ownerTokenIdentifier",
    "source",
  ]),

  aiItems: defineTable({
    ...candidateFields,
    appearances: v.number(),
    code: v.string(),
    decision: v.optional(v.union(v.literal("yes"), v.literal("no"))),
    lastActionId: v.optional(v.id("aiActions")),
    lastNotifiedAt: v.optional(v.number()),
    lastNotifiedMilestone: v.optional(v.string()),
    ownerTokenIdentifier: v.string(),
    pendingReceiptId: v.optional(v.id("aiReceipts")),
    resolutionReason: v.optional(v.string()),
    snoozedUntil: v.optional(v.number()),
    status: itemStatus,
    userResolutionAt: v.optional(v.number()),
    version: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_ownerTokenIdentifier_and_source_and_sourceKey", [
      "ownerTokenIdentifier",
      "source",
      "sourceKey",
    ])
    .index("by_ownerTokenIdentifier_and_status_and_nextNotifyAt", [
      "ownerTokenIdentifier",
      "status",
      "nextNotifyAt",
    ])
    .index("by_ownerTokenIdentifier_and_status_and_usefulUntil", [
      "ownerTokenIdentifier",
      "status",
      "usefulUntil",
    ])
    .index("by_ownerTokenIdentifier_and_checkedAt", [
      "ownerTokenIdentifier",
      "checkedAt",
    ]),

  aiReceipts: defineTable({
    createdAt: v.number(),
    dispatchedAt: v.optional(v.number()),
    expiresAt: v.number(),
    idempotencyKey: v.string(),
    items: v.array(
      v.object({
        code: v.string(),
        itemId: v.id("aiItems"),
        title: v.string(),
        version: v.number(),
        whyNow: v.string(),
      })
    ),
    ownerTokenIdentifier: v.string(),
    printJobId: v.optional(v.id("printJobs")),
    title: v.string(),
  })
    .index("by_ownerTokenIdentifier_and_createdAt", [
      "ownerTokenIdentifier",
      "createdAt",
    ])
    .index("by_ownerTokenIdentifier_and_idempotencyKey", [
      "ownerTokenIdentifier",
      "idempotencyKey",
    ]),

  aiReplies: defineTable({
    body: v.string(),
    createdAt: v.number(),
    idempotencyKey: v.string(),
    itemCode: v.optional(v.string()),
    itemSource: v.optional(v.string()),
    itemVersion: v.optional(v.number()),
    ownerTokenIdentifier: v.string(),
    processedAt: v.optional(v.number()),
    receiptId: v.optional(v.id("aiReceipts")),
    result: v.optional(v.string()),
    senderPhone: v.optional(v.string()),
    source: v.union(v.literal("sms"), v.literal("web")),
    status: v.union(v.literal("pending"), v.literal("processed")),
  })
    .index("by_ownerTokenIdentifier_and_source_and_idempotencyKey", [
      "ownerTokenIdentifier",
      "source",
      "idempotencyKey",
    ])
    .index("by_ownerTokenIdentifier_and_status_and_createdAt", [
      "ownerTokenIdentifier",
      "status",
      "createdAt",
    ]),

  aiSettings: defineTable({
    nextCode: v.number(),
    ownerTokenIdentifier: v.string(),
    paperEnabled: v.boolean(),
    pausedSources: v.array(v.string()),
    phone: v.optional(v.string()),
    singleton: v.literal("primary"),
  }).index("by_singleton", ["singleton"]),
};
