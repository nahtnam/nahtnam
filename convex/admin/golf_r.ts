/* eslint-disable unicorn/filename-case */
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

const attachmentValidator = v.object({
  contentType: v.optional(v.string()),
  name: v.string(),
  storageId: v.id("_storage"),
});

export const listItems = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return ctx.db
      .query("golfRItems")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

export const createItem = mutation({
  args: {
    attachments: v.optional(v.array(attachmentValidator)),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    modification: v.optional(v.boolean()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("golfRItems", args);
  },
});

export const updateItem = mutation({
  args: {
    attachments: v.optional(v.array(attachmentValidator)),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    id: v.id("golfRItems"),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    modification: v.optional(v.boolean()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    const existingItem = await ctx.db.get("golfRItems", id);
    if (!existingItem) {
      return;
    }

    const nextAttachmentIds = new Set(
      (data.attachments ?? []).map((attachment) => attachment.storageId),
    );

    for (const attachment of existingItem.attachments ?? []) {
      if (!nextAttachmentIds.has(attachment.storageId)) {
        await ctx.storage.delete(attachment.storageId);
      }
    }

    await ctx.db.patch("golfRItems", id, data);
  },
});

export const deleteItem = mutation({
  args: { id: v.id("golfRItems") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    const existingItem = await ctx.db.get("golfRItems", id);
    for (const attachment of existingItem?.attachments ?? []) {
      await ctx.storage.delete(attachment.storageId);
    }

    await ctx.db.delete("golfRItems", id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const getAttachmentUrl = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, { storageId }) {
    await requireAdmin(ctx);
    return ctx.storage.getUrl(storageId);
  },
});

export const deleteAttachment = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, { storageId }) {
    await requireAdmin(ctx);
    await ctx.storage.delete(storageId);
  },
});
