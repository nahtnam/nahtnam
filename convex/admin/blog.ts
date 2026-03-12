import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const listAllPosts = query({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_publishedAt")
      .order("desc")
      .collect();

    const postsWithCategory = await Promise.all(
      posts.map(async (post) => {
        const category = await ctx.db.get("blogCategories", post.categoryId);
        return { ...post, category: category! };
      }),
    );

    return postsWithCategory;
  },
});

export const getPostById = query({
  args: { adminSecret: v.string(), id: v.id("blogPosts") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    const post = await ctx.db.get("blogPosts", id);
    if (!post) {
      return null;
    }

    const category = await ctx.db.get("blogCategories", post.categoryId);
    return { ...post, category: category! };
  },
});

export const listCategories = query({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.db.query("blogCategories").collect();
  },
});

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
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("blogPosts", args);
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
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("blogPosts", id, data);
  },
});

export const deletePost = mutation({
  args: { adminSecret: v.string(), id: v.id("blogPosts") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("blogPosts", id);
  },
});

export const createCategory = mutation({
  args: { adminSecret: v.string(), name: v.string() },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("blogCategories", args);
  },
});

export const updateCategory = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("blogCategories"),
    name: v.string(),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("blogCategories", id, data);
  },
});

export const deleteCategory = mutation({
  args: { adminSecret: v.string(), id: v.id("blogCategories") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("blogCategories", id);
  },
});

export const generateUploadUrl = mutation({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = mutation({
  args: { adminSecret: v.string(), storageId: v.id("_storage") },
  async handler(ctx, { adminSecret, storageId }) {
    requireAdmin(adminSecret);
    return ctx.storage.getUrl(storageId);
  },
});
