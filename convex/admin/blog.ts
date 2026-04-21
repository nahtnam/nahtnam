import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const listAllPosts = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
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
  args: { id: v.id("blogPosts") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    const post = await ctx.db.get("blogPosts", id);
    if (!post) {
      return null;
    }

    const category = await ctx.db.get("blogCategories", post.categoryId);
    return { ...post, category: category! };
  },
});

export const listCategories = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return ctx.db.query("blogCategories").collect();
  },
});

export const createPost = mutation({
  args: {
    categoryId: v.id("blogCategories"),
    content: v.string(),
    excerpt: v.string(),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("blogPosts", args);
  },
});

export const updatePost = mutation({
  args: {
    categoryId: v.id("blogCategories"),
    content: v.string(),
    excerpt: v.string(),
    id: v.id("blogPosts"),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("blogPosts", id, data);
  },
});

export const deletePost = mutation({
  args: { id: v.id("blogPosts") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    await ctx.db.delete("blogPosts", id);
  },
});

export const createCategory = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("blogCategories", args);
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("blogCategories"),
    name: v.string(),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("blogCategories", id, data);
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("blogCategories") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    await ctx.db.delete("blogCategories", id);
  },
});

export const backfillPublishedFlags = mutation({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    const now = Date.now();
    const posts = await ctx.db.query("blogPosts").collect();

    await Promise.all(
      posts.map(async (post) => {
        if (post.published !== undefined) {
          return;
        }

        await ctx.db.patch("blogPosts", post._id, {
          published: post.publishedAt <= now,
        });
      }),
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, { storageId }) {
    await requireAdmin(ctx);
    return ctx.storage.getUrl(storageId);
  },
});
