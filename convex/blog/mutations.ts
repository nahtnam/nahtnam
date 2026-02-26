import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdmin } from "../lib/admin";

export const createPost = mutation({
  args: {
    adminSecret: v.string(),
    categoryId: v.id("blogCategories"),
    content: v.string(),
    excerpt: v.string(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, ...data } = args;
    return ctx.db.insert("blogPosts", data);
  },
});

export const updatePost = mutation({
  args: {
    adminSecret: v.string(),
    categoryId: v.id("blogCategories"),
    content: v.string(),
    excerpt: v.string(),
    id: v.id("blogPosts"),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, id, ...data } = args;
    await ctx.db.patch("blogPosts", id, data);
  },
});

export const deletePost = mutation({
  args: { adminSecret: v.string(), id: v.id("blogPosts") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    await ctx.db.delete("blogPosts", args.id);
  },
});

export const createCategory = mutation({
  args: { adminSecret: v.string(), name: v.string() },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, ...data } = args;
    return ctx.db.insert("blogCategories", data);
  },
});

export const updateCategory = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("blogCategories"),
    name: v.string(),
  },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, id, ...data } = args;
    await ctx.db.patch("blogCategories", id, data);
  },
});

export const deleteCategory = mutation({
  args: { adminSecret: v.string(), id: v.id("blogCategories") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    await ctx.db.delete("blogCategories", args.id);
  },
});

export const generateUploadUrl = mutation({
  args: { adminSecret: v.string() },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    return ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = mutation({
  args: { adminSecret: v.string(), storageId: v.id("_storage") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    return ctx.storage.getUrl(args.storageId);
  },
});
