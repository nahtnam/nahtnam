import { v } from "convex/values";

import { convex } from "../fluent";

const MAX_PUBLIC_POSTS = 100;

export const listPosts = convex
  .query()
  .input({})
  .handler(async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_published_publishedAt", (query) =>
        query.eq("published", true).lte("publishedAt", Date.now())
      )
      .order("desc")
      .take(MAX_PUBLIC_POSTS);

    return Promise.all(
      posts.map(async (post) => {
        const category = await ctx.db.get("blogCategories", post.categoryId);

        if (!category) {
          throw new Error(`Missing category for blog post ${post._id}`);
        }

        return { ...post, category };
      })
    );
  })
  .public();

export const getPost = convex
  .query()
  .input({ slug: v.string() })
  .handler(async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_published_slug", (query) =>
        query.eq("published", true).eq("slug", args.slug)
      )
      .first();

    if (!post || post.publishedAt > Date.now()) {
      return null;
    }

    const category = await ctx.db.get("blogCategories", post.categoryId);

    if (!category) {
      throw new Error(`Missing category for blog post ${post._id}`);
    }

    return { ...post, category };
  })
  .public();
