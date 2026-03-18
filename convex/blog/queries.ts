import { v } from "convex/values";
import { query } from "../_generated/server";

export const listPosts = query({
  args: {},
  async handler(ctx) {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_published_publishedAt", (q) => q.eq("published", true))
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
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_published_slug", (q) =>
        q.eq("published", true).eq("slug", args.slug),
      )
      .first();

    if (!post) {
      return null;
    }

    const category = await ctx.db.get("blogCategories", post.categoryId);
    return { ...post, category: category! };
  },
});
