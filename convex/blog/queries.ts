import { v } from "convex/values";
import { query } from "../_generated/server";

export const listPosts = query({
  args: {},
  async handler(ctx) {
    const now = Date.now();
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_publishedAt")
      .filter((q) => q.lte(q.field("publishedAt"), now))
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

export const getPost = query({
  args: { slug: v.string() },
  async handler(ctx, args) {
    const now = Date.now();
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post || post.publishedAt > now) {
      return null;
    }

    const category = await ctx.db.get("blogCategories", post.categoryId);
    return { ...post, category: category! };
  },
});
