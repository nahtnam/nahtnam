/* oxlint-disable sonarjs/no-undefined-assignment */
import type { FunctionReference } from "convex/server";
import { makeFunctionReference } from "convex/server";
import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { adminAction, adminMutation, adminQuery, convex } from "../fluent";
import type { Tweet } from "../lib/tweets";
import { fetchTweetById } from "../lib/tweets";

type CachedTweet = {
  fetchedAt: number;
  id: string;
  sourceUrl: string;
  tweet: Tweet;
};

type SaveXPostArgs = {
  categoryId: Id<"blogCategories">;
  excerpt: string;
  id?: Id<"blogPosts">;
  published: boolean;
  publishedAt: number;
  slug: string;
  title: string;
  tweetIds: string[];
  tweets: CachedTweet[];
  tweetsFetchedAt: number;
};

const getPostForTweetRefreshReference = makeFunctionReference(
  "admin/blog:getPostForTweetRefresh"
) as unknown as FunctionReference<
  "query",
  "internal",
  { id: Id<"blogPosts"> },
  Doc<"blogPosts"> | null
>;

const saveXPostReference = makeFunctionReference(
  "admin/blog:saveXPost"
) as unknown as FunctionReference<
  "mutation",
  "internal",
  SaveXPostArgs,
  Id<"blogPosts">
>;

const cachedTweetValidator = v.object({
  fetchedAt: v.number(),
  id: v.string(),
  sourceUrl: v.string(),
  tweet: v.any(),
});

function extractTweetIds(input: string) {
  const ids = new Set<string>();

  for (const rawPart of input.split(/\s+/u)) {
    const part = rawPart.trim();
    const statusMatch = /(?:status|statuses)\/(?<id>\d+)/u.exec(part);
    const candidate = statusMatch?.groups?.id ?? part;

    if (/^\d+$/u.test(candidate)) {
      ids.add(candidate);
    }
  }

  return [...ids];
}

function sourceUrlForTweetId(id: string) {
  return `https://x.com/i/status/${id}`;
}

function firstSentence(text: string) {
  const [firstLine] = text.split(/\n+/u);
  return firstLine?.trim() ?? text.trim();
}

function truncateText(text: string, maxLength: number) {
  const normalized = text.replaceAll(/\s+/gu, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/gu, "")
    .replaceAll(/\s+/gu, "-")
    .replaceAll(/-+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

function valueOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

async function fetchTweetThreadFromLastTweetId(lastTweetId: string) {
  const seen = new Set<string>();
  const tweets: CachedTweet[] = [];
  let currentId: string | undefined = lastTweetId;
  let expectedScreenName: string | undefined;

  while (currentId && !seen.has(currentId) && tweets.length < 50) {
    seen.add(currentId);
    // Thread traversal depends on the previous tweet's parent ID.
    // oxlint-disable-next-line eslint/no-await-in-loop
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

  return tweets.toReversed();
}

function fetchTweetsInOrder(tweetIds: string[]) {
  return Promise.all(
    tweetIds.map(async (id) => {
      const tweet = await fetchTweetById(id);
      return {
        fetchedAt: Date.now(),
        id: tweet.id_str,
        sourceUrl: sourceUrlForTweetId(tweet.id_str),
        tweet,
      };
    })
  );
}

export const listAllPosts = adminQuery
  .input({})
  .handler(async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(500);

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

export const getPostById = adminQuery
  .input({ id: v.id("blogPosts") })
  .handler(async (ctx, args) => {
    const post = await ctx.db.get("blogPosts", args.id);

    if (!post) {
      return null;
    }

    const category = await ctx.db.get("blogCategories", post.categoryId);

    if (!category) {
      throw new Error(`Missing category for blog post ${post._id}`);
    }

    return { ...post, category };
  })
  .public();

export const listCategories = adminQuery
  .input({})
  .handler((ctx) => ctx.db.query("blogCategories").take(200))
  .public();

export const listMedia = adminQuery
  .input({})
  .handler(async (ctx) => {
    const media = await ctx.db
      .query("blogMedia")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);

    return Promise.all(
      media.map(async (item) => ({
        ...item,
        url: await ctx.storage.getUrl(item.storageId),
      }))
    );
  })
  .public();

export const getPostForTweetRefresh = convex
  .query()
  .input({ id: v.id("blogPosts") })
  .handler((ctx, args) => ctx.db.get("blogPosts", args.id))
  .internal();

export const saveXPost = convex
  .mutation()
  .input({
    categoryId: v.id("blogCategories"),
    excerpt: v.string(),
    id: v.optional(v.id("blogPosts")),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
    tweetIds: v.array(v.string()),
    tweets: v.array(cachedTweetValidator),
    tweetsFetchedAt: v.number(),
  })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
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
  })
  .internal();

export const saveImportedXPost = adminAction
  .input({
    categoryId: v.id("blogCategories"),
    excerpt: v.optional(v.string()),
    id: v.optional(v.id("blogPosts")),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    tweetInput: v.string(),
  })
  .handler(async (ctx, args) => {
    const tweetIds = extractTweetIds(args.tweetInput);

    if (tweetIds.length === 0) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Enter at least one valid tweet URL or ID",
      });
    }

    const [tweetId] = tweetIds;
    const tweets =
      tweetIds.length === 1 && tweetId
        ? await fetchTweetThreadFromLastTweetId(tweetId)
        : await fetchTweetsInOrder(tweetIds);
    const firstTweet = tweets[0]?.tweet;

    if (!firstTweet) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Tweet not found",
      });
    }

    const title = valueOrFallback(
      args.title,
      truncateText(firstSentence(firstTweet.text), 80)
    );
    const excerpt = valueOrFallback(
      args.excerpt,
      truncateText(tweets.map(({ tweet }) => tweet.text).join(" "), 160)
    );
    const tweetsFetchedAt = Date.now();

    return ctx.runMutation(saveXPostReference, {
      categoryId: args.categoryId,
      excerpt,
      id: args.id,
      published: args.published,
      publishedAt: args.publishedAt,
      slug: valueOrFallback(args.slug, slugify(title)),
      title,
      tweetIds: tweets.map(({ id }) => id),
      tweets: tweets.map((tweet) => ({ ...tweet, fetchedAt: tweetsFetchedAt })),
      tweetsFetchedAt,
    });
  })
  .public();

export const refreshXPost = adminAction
  .input({ id: v.id("blogPosts") })
  .handler(async (ctx, args) => {
    const post = await ctx.runQuery(getPostForTweetRefreshReference, args);

    if (!post || (post.kind ?? "markdown") !== "x" || !post.tweetIds?.length) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "This post does not contain a refreshable X thread",
      });
    }

    const tweets = await fetchTweetsInOrder(post.tweetIds);
    const tweetsFetchedAt = Date.now();

    return ctx.runMutation(saveXPostReference, {
      categoryId: post.categoryId,
      excerpt: post.excerpt,
      id: args.id,
      published: post.published,
      publishedAt: post.publishedAt,
      slug: post.slug,
      title: post.title,
      tweetIds: tweets.map(({ id }) => id),
      tweets: tweets.map((tweet) => ({ ...tweet, fetchedAt: tweetsFetchedAt })),
      tweetsFetchedAt,
    });
  })
  .public();

export const createPost = adminMutation
  .input({
    categoryId: v.id("blogCategories"),
    contentPath: v.string(),
    excerpt: v.string(),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  })
  .handler((ctx, args) =>
    ctx.db.insert("blogPosts", { ...args, kind: "markdown" })
  )
  .public();

export const updatePost = adminMutation
  .input({
    categoryId: v.id("blogCategories"),
    contentPath: v.string(),
    excerpt: v.string(),
    id: v.id("blogPosts"),
    published: v.boolean(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch("blogPosts", id, {
      ...data,
      kind: "markdown",
      tweetIds: undefined,
      tweets: undefined,
      tweetsFetchedAt: undefined,
    });
    return null;
  })
  .public();

export const deletePost = adminMutation
  .input({ id: v.id("blogPosts") })
  .handler(async (ctx, args) => {
    const media = await ctx.db
      .query("blogMedia")
      .withIndex("by_postId", (query) => query.eq("postId", args.id))
      .take(101);

    if (media.length > 100) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Remove excess post media before deleting this post",
      });
    }

    await Promise.all(
      media.map(async (item) => {
        await ctx.storage.delete(item.storageId);
        await ctx.db.delete("blogMedia", item._id);
      })
    );

    await ctx.db.delete("blogPosts", args.id);
    return null;
  })
  .public();

export const createCategory = adminMutation
  .input({ name: v.string() })
  .handler((ctx, args) => ctx.db.insert("blogCategories", args))
  .public();

export const updateCategory = adminMutation
  .input({ id: v.id("blogCategories"), name: v.string() })
  .handler(async (ctx, args) => {
    await ctx.db.patch("blogCategories", args.id, { name: args.name });
    return null;
  })
  .public();

export const deleteCategory = adminMutation
  .input({ id: v.id("blogCategories") })
  .handler(async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_categoryId", (query) => query.eq("categoryId", args.id))
      .first();

    if (post) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Delete or reassign this category's blog posts first",
      });
    }

    await ctx.db.delete("blogCategories", args.id);
    return null;
  })
  .public();

export const generateUploadUrl = adminMutation
  .input({})
  .handler((ctx) => ctx.storage.generateUploadUrl())
  .public();

export const createMedia = adminMutation
  .input({
    contentType: v.optional(v.string()),
    name: v.string(),
    postId: v.optional(v.id("blogPosts")),
    storageId: v.id("_storage"),
  })
  .handler(async (ctx, args) => {
    if (args.postId) {
      const post = await ctx.db.get("blogPosts", args.postId);

      if (!post) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Post not found" });
      }
    }

    const [id, url] = await Promise.all([
      ctx.db.insert("blogMedia", {
        ...args,
        createdAt: Date.now(),
      }),
      ctx.storage.getUrl(args.storageId),
    ]);

    return {
      id,
      markdown: url ? `![${args.name}](${url})` : "",
      url,
    };
  })
  .public();

export const getImageUrl = adminMutation
  .input({ storageId: v.id("_storage") })
  .handler((ctx, args) => ctx.storage.getUrl(args.storageId))
  .public();
