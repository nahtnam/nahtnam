import { v } from "convex/values";

import { adminMutation, adminQuery } from "../fluent";

const attachmentValidator = v.object({
  contentType: v.optional(v.string()),
  name: v.string(),
  storageId: v.id("_storage"),
});

const itemInput = {
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
};

export const listItems = adminQuery
  .input({})
  .handler((ctx) =>
    ctx.db.query("golfRItems").withIndex("by_date").order("desc").take(500)
  )
  .public();

export const createItem = adminMutation
  .input(itemInput)
  .handler((ctx, args) => ctx.db.insert("golfRItems", args))
  .public();

export const updateItem = adminMutation
  .input({ id: v.id("golfRItems"), ...itemInput })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
    const existingItem = await ctx.db.get("golfRItems", id);

    if (existingItem) {
      const nextAttachmentIds = new Set(
        (data.attachments ?? []).map((attachment) => attachment.storageId)
      );
      const removedAttachments = (existingItem.attachments ?? []).filter(
        (attachment) => !nextAttachmentIds.has(attachment.storageId)
      );

      await Promise.all([
        ...removedAttachments.map((attachment) =>
          ctx.storage.delete(attachment.storageId)
        ),
        ctx.db.patch("golfRItems", id, data),
      ]);
    }

    return null;
  })
  .public();

export const deleteItem = adminMutation
  .input({ id: v.id("golfRItems") })
  .handler(async (ctx, args) => {
    const existingItem = await ctx.db.get("golfRItems", args.id);

    await Promise.all([
      ...(existingItem?.attachments ?? []).map((attachment) =>
        ctx.storage.delete(attachment.storageId)
      ),
      ctx.db.delete("golfRItems", args.id),
    ]);
    return null;
  })
  .public();

export const generateUploadUrl = adminMutation
  .input({})
  .handler((ctx) => ctx.storage.generateUploadUrl())
  .public();

export const getAttachmentUrl = adminMutation
  .input({ storageId: v.id("_storage") })
  .handler((ctx, args) => ctx.storage.getUrl(args.storageId))
  .public();

export const deleteAttachment = adminMutation
  .input({ storageId: v.id("_storage") })
  .handler(async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return null;
  })
  .public();
