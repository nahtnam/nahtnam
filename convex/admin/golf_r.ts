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
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.db
      .query("golfRItems")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

export const createItem = mutation({
  args: {
    adminSecret: v.string(),
    attachments: v.optional(v.array(attachmentValidator)),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("golfRItems", args);
  },
});

export const updateItem = mutation({
  args: {
    adminSecret: v.string(),
    attachments: v.optional(v.array(attachmentValidator)),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    id: v.id("golfRItems"),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
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
  args: { adminSecret: v.string(), id: v.id("golfRItems") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    const existingItem = await ctx.db.get("golfRItems", id);
    for (const attachment of existingItem?.attachments ?? []) {
      await ctx.storage.delete(attachment.storageId);
    }

    await ctx.db.delete("golfRItems", id);
  },
});

export const generateUploadUrl = mutation({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.storage.generateUploadUrl();
  },
});

export const getAttachmentUrl = mutation({
  args: { adminSecret: v.string(), storageId: v.id("_storage") },
  async handler(ctx, { adminSecret, storageId }) {
    requireAdmin(adminSecret);
    return ctx.storage.getUrl(storageId);
  },
});

export const deleteAttachment = mutation({
  args: { adminSecret: v.string(), storageId: v.id("_storage") },
  async handler(ctx, { adminSecret, storageId }) {
    requireAdmin(adminSecret);
    await ctx.storage.delete(storageId);
  },
});
