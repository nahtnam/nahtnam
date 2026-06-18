import { v } from "convex/values";
import { getTweet, type Tweet } from "react-tweet/api";
import { internal } from "../_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireAdmin } from "../lib/builder";

class InvalidTweetInputError extends Error {
  readonly input: string;

  constructor(options: { readonly input: string }) {
    super("Invalid tweet input");
    this.name = "InvalidTweetInputError";
    this.input = options.input;
  }
}

class TweetNotFoundError extends Error {
  readonly id: string;

  constructor(options: { readonly id: string }) {
    super("Tweet not found");
    this.name = "TweetNotFoundError";
    this.id = options.id;
  }
}

type CachedTweet = {
  fetchedAt: number;
  id: string;
  sourceUrl: string;
  tweet: Tweet;
};

function extractTweetIds(input: string) {
  return [
    ...new Set(
      input
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const statusMatch = /(?:status|statuses)\/(\d+)/.exec(part);
          return statusMatch?.[1] ?? part;
        })
        .map((part) => /^\d+$/.exec(part)?.[0])
        .filter((id): id is string => typeof id === "string"),
    ),
  ];
}

function sourceUrlForTweetId(id: string) {
  return `https://x.com/i/status/${id}`;
}

function firstSentence(text: string) {
  return text.split(/\n+/)[0]?.trim() ?? text.trim();
}

function truncateText(text: string, maxLength: number) {
  const normalized = text.replaceAll(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function valueOrFallback(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  if (trimmed) {
    return trimmed;
  }

  return fallback;
}

function contentFromTweets(tweets: CachedTweet[]) {
  return tweets
    .map(({ tweet }, index) => `${index + 1}. ${tweet.text}`)
    .join("\n\n");
}

async function fetchTweetById(id: string) {
  const tweet = await getTweet(id);
  if (tweet?.__typename !== "Tweet") {
    throw new TweetNotFoundError({ id });
  }

  return tweet;
}

async function fetchTweetThreadFromLastTweetId(lastTweetId: string) {
  const seen = new Set<string>();
  const tweets: CachedTweet[] = [];
  let currentId: string | undefined = lastTweetId;
  let expectedScreenName: string | undefined;

  while (currentId && !seen.has(currentId) && tweets.length < 50) {
    seen.add(currentId);
    const tweet = await fetchTweetById(currentId);

    expectedScreenName ??= tweet.user.screen_name;
    if (tweet.user.screen_name !== expectedScreenName) {
      break;
    }

    tweets.push({
      fetchedAt: Date.now(),
      id: tweet.id_str,
      sourceUrl: sourceUrlForTweetId(tweet.id_str),
      tweet,
    });

    currentId = tweet.in_reply_to_status_id_str;
  }

  return tweets.reverse();
}

async function fetchTweetsInOrder(tweetIds: string[]) {
  const tweets: CachedTweet[] = [];

  for (const id of tweetIds) {
    const tweet = await fetchTweetById(id);
    tweets.push({
      fetchedAt: Date.now(),
      id: tweet.id_str,
      sourceUrl: sourceUrlForTweetId(tweet.id_str),
      tweet,
    });
  }

  return tweets;
}

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

export const listMedia = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    const media = await ctx.db
      .query("blogMedia")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);

    return Promise.all(
      media.map(async (item) => ({
        ...item,
        url: await ctx.storage.getUrl(item.storageId),
      })),
    );
  },
});

export const getPostForTweetRefresh = internalQuery({
  args: { id: v.id("blogPosts") },
  async handler(ctx, { id }) {
    return ctx.db.get("blogPosts", id);
  },
});

export const saveXPost = internalMutation({
  args: {
    categoryId: v.id("blogCategories"),
    content: v.string(),
    excerpt: v.string(),
    id: v.optional(v.id("blogPosts")),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
    tweetIds: v.array(v.string()),
    tweets: v.array(
      v.object({
        fetchedAt: v.number(),
        id: v.string(),
        sourceUrl: v.string(),
        tweet: v.any(),
      }),
    ),
    tweetsFetchedAt: v.number(),
  },
  async handler(ctx, { id, ...data }) {
    const post = {
      ...data,
      contentPath: undefined,
      kind: "x" as const,
    };

    if (id) {
      await ctx.db.patch("blogPosts", id, post);
      return id;
    }

    return ctx.db.insert("blogPosts", post);
  },
});

export const saveImportedXPost = action({
  args: {
    categoryId: v.id("blogCategories"),
    excerpt: v.optional(v.string()),
    id: v.optional(v.id("blogPosts")),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    tweetInput: v.string(),
  },
  async handler(ctx, args): Promise<Id<"blogPosts">> {
    await requireAdmin(ctx);

    const tweetIds = extractTweetIds(args.tweetInput);
    if (tweetIds.length === 0) {
      throw new InvalidTweetInputError({ input: args.tweetInput });
    }

    const [tweetId] = tweetIds;
    const tweets =
      tweetIds.length === 1 && tweetId
        ? await fetchTweetThreadFromLastTweetId(tweetId)
        : await fetchTweetsInOrder(tweetIds);

    const firstTweet = tweets[0]?.tweet;
    if (!firstTweet) {
      throw new InvalidTweetInputError({ input: args.tweetInput });
    }

    const title = valueOrFallback(
      args.title,
      truncateText(firstSentence(firstTweet.text), 80),
    );
    const excerpt = valueOrFallback(
      args.excerpt,
      truncateText(tweets.map(({ tweet }) => tweet.text).join(" "), 160),
    );
    const slug = valueOrFallback(args.slug, slugify(title));
    const tweetsFetchedAt = Date.now();

    return ctx.runMutation(internal.admin.blog.saveXPost, {
      categoryId: args.categoryId,
      content: contentFromTweets(tweets),
      excerpt,
      id: args.id,
      published: args.published,
      publishedAt: args.publishedAt,
      slug,
      title,
      tweetIds: tweets.map(({ id }) => id),
      tweets: tweets.map((tweet) => ({ ...tweet, fetchedAt: tweetsFetchedAt })),
      tweetsFetchedAt,
    });
  },
});

export const refreshXPost = action({
  args: { id: v.id("blogPosts") },
  async handler(ctx, { id }): Promise<Id<"blogPosts">> {
    await requireAdmin(ctx);

    const post = await ctx.runQuery(
      internal.admin.blog.getPostForTweetRefresh,
      {
        id,
      },
    );

    if (!post || (post.kind ?? "markdown") !== "x" || !post.tweetIds?.length) {
      throw new InvalidTweetInputError({ input: id });
    }

    const tweets = await fetchTweetsInOrder(post.tweetIds);
    const tweetsFetchedAt = Date.now();

    return ctx.runMutation(internal.admin.blog.saveXPost, {
      categoryId: post.categoryId,
      content: contentFromTweets(tweets),
      excerpt: post.excerpt,
      id,
      published: post.published ?? true,
      publishedAt: post.publishedAt,
      slug: post.slug,
      title: post.title,
      tweetIds: tweets.map(({ id }) => id),
      tweets: tweets.map((tweet) => ({ ...tweet, fetchedAt: tweetsFetchedAt })),
      tweetsFetchedAt,
    });
  },
});

export const createPost = mutation({
  args: {
    categoryId: v.id("blogCategories"),
    contentPath: v.string(),
    excerpt: v.string(),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("blogPosts", {
      ...args,
      content: "",
      kind: "markdown",
    });
  },
});

export const updatePost = mutation({
  args: {
    categoryId: v.id("blogCategories"),
    contentPath: v.string(),
    excerpt: v.string(),
    id: v.id("blogPosts"),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("blogPosts", id, { ...data, kind: "markdown" });
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

export const backfillContentPaths = mutation({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    const posts = await ctx.db.query("blogPosts").collect();

    await Promise.all(
      posts.map(async (post) => {
        if ((post.kind ?? "markdown") !== "markdown" || post.contentPath) {
          return;
        }

        await ctx.db.patch("blogPosts", post._id, {
          contentPath: `content/blog/${post.slug}.md`,
        });
      }),
    );
  },
});

export const backfillContent = mutation({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    const posts = await ctx.db.query("blogPosts").collect();

    await Promise.all(
      posts.map(async (post) => {
        if ((post.kind ?? "markdown") !== "markdown") {
          return;
        }

        await ctx.db.patch("blogPosts", post._id, {
          content: "",
          contentPath: `content/blog/${post.slug}.md`,
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

export const createMedia = mutation({
  args: {
    contentType: v.optional(v.string()),
    name: v.string(),
    postId: v.optional(v.id("blogPosts")),
    storageId: v.id("_storage"),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    const id = await ctx.db.insert("blogMedia", {
      ...args,
      createdAt: Date.now(),
    });
    const url = await ctx.storage.getUrl(args.storageId);

    return {
      id,
      markdown: url ? `![${args.name}](${url})` : "",
      url,
    };
  },
});

export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, { storageId }) {
    await requireAdmin(ctx);
    return ctx.storage.getUrl(storageId);
  },
});
