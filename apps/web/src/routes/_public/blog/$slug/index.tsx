/* oxlint-disable react/no-danger */
import { api } from "@repo/backend/api";
import { appUrl } from "@repo/config/app";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import Markdown from "react-markdown";
import { EmbeddedTweet } from "react-tweet";
import type { Tweet } from "react-tweet/api";

import { getBlogMarkdownContent } from "@/lib/blog/markdown";
import {
  canonicalUrl,
  createSeo,
  ogImageUrl,
  siteImage,
  siteTitle,
} from "@/lib/seo";

import reactTweetCss from "react-tweet/theme.css?url";

const getPost = createConvexRouteQuery("getPost", api.blog.queries.getPost);

export const Route = createFileRoute("/_public/blog/$slug/")({
  component: BlogPostPage,
  async loader(context) {
    const result = await getPost.fetchRoute(context, {
      slug: context.params.slug,
    });

    if (!result.data) {
      throw notFound();
    }

    return {
      ...result.routeData,
      seoPost: {
        categoryName: result.data.category.name,
        excerpt: result.data.excerpt,
        publishedAt: result.data.publishedAt,
        title: result.data.title,
      },
    };
  },
  head({ loaderData, params }) {
    const post = loaderData?.seoPost;
    const seo = createSeo({
      description: post?.excerpt ?? "A blog post by Manthan (@nahtnam).",
      imageLabel: post?.categoryName ?? "Writing",
      path: `/blog/${params.slug}`,
      publishedAt: post?.publishedAt,
      section: post?.categoryName,
      socialTitle: post?.title ?? "Blog Post",
      title: post ? `${post.title} | ${siteTitle}` : `Blog Post | ${siteTitle}`,
      type: "article",
    });

    return {
      ...seo,
      links: [{ href: reactTweetCss, rel: "stylesheet" }, ...seo.links],
    };
  },
});

function BlogPostPage() {
  const { data: post } = getPost.useSuspenseRouteQuery(Route);

  if (!post) {
    return null;
  }

  const publishedAt = new Date(post.publishedAt);
  const kind = post.kind ?? "markdown";
  const markdownContent = getBlogMarkdownContent(post.contentPath) ?? "";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    articleSection: post.category.name,
    author: {
      "@type": "Person",
      image: siteImage,
      name: "Manthan",
      url: appUrl,
    },
    dateModified: publishedAt.toISOString(),
    datePublished: publishedAt.toISOString(),
    description: post.excerpt,
    headline: post.title,
    image: ogImageUrl({
      description: post.excerpt,
      label: post.category.name,
      path: `/blog/${post.slug}`,
      title: post.title,
    }),
    mainEntityOfPage: canonicalUrl(`/blog/${post.slug}`),
    publisher: {
      "@type": "Person",
      image: siteImage,
      name: "Manthan",
      url: appUrl,
    },
    url: canonicalUrl(`/blog/${post.slug}`),
  };

  return (
    <div className="page-shell page-shell-article">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />

      <nav
        aria-label="Breadcrumb"
        className="breadcrumbs mb-10 overflow-visible p-0 text-sm"
      >
        <ul>
          <li>
            <Link
              className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-base-content/55 transition-colors hover:text-base-content"
              to="/blog"
            >
              <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
              Back to blog
            </Link>
          </li>
        </ul>
      </nav>

      <header className="border-y border-base-content/15 py-9 sm:py-14">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[0.7rem] font-semibold tracking-[0.12em] text-base-content/50 uppercase">
          <span>{post.category.name}</span>
          <span aria-hidden="true" className="text-base-content/25">
            /
          </span>
          <div
            className="tooltip tooltip-right"
            data-tip={formatFullDate({ date: publishedAt })}
          >
            <time
              dateTime={publishedAt.toISOString()}
              title={formatFullDate({ date: publishedAt })}
            >
              {formatDistanceToNow(publishedAt, { addSuffix: true })}
            </time>
          </div>
        </div>
        <h1 className="heading mt-6 max-w-4xl hyphens-auto text-[clamp(2.6rem,8vw,5.25rem)] leading-[0.97] tracking-[-0.055em] [overflow-wrap:anywhere]">
          {post.title}
        </h1>
        <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-base-content/65 sm:text-xl">
          {post.excerpt}
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-[44rem] sm:mt-16">
        <article className="article-prose prose-headings:text-pretty prose-p:text-[1.0625rem]">
          {kind === "x" ? <TweetThread tweets={post.tweets ?? []} /> : null}
          {kind === "markdown" ? <Markdown>{markdownContent}</Markdown> : null}
        </article>
      </div>
    </div>
  );
}

type TweetThreadProps = {
  readonly tweets: readonly {
    readonly id: string;
    readonly sourceUrl: string;
    readonly tweet: unknown;
  }[];
};

function TweetThread(props: TweetThreadProps) {
  const { tweets } = props;
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  return (
    <ol
      className="tweet-thread not-prose mx-auto flex max-w-[660px] flex-col"
      data-theme="light"
    >
      {tweets.map((item, index) => (
        <li
          key={item.id}
          className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-8 last:pb-0 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-4 sm:pb-10"
        >
          <div aria-hidden="true" className="relative flex justify-center">
            {index < tweets.length - 1 ? (
              <span className="absolute top-8 bottom-[-0.5rem] w-px bg-gradient-to-b from-primary/45 via-base-300 to-base-300 sm:top-10 sm:bottom-[-0.75rem]" />
            ) : null}
            <span className="relative z-10 flex size-8 items-center justify-center rounded-full border border-primary/25 bg-base-100 font-mono text-[0.625rem] font-semibold text-primary sm:size-10 sm:text-xs">
              {index + 1}
            </span>
          </div>
          <div className="min-w-0">
            <span className="sr-only">
              Tweet {index + 1} of {tweets.length}.{" "}
            </span>
            {isHydrated ? (
              <EmbeddedTweet tweet={item.tweet as Tweet} />
            ) : (
              <a
                className="link link-hover inline-block py-6 font-mono text-sm text-base-content/60"
                href={item.sourceUrl}
              >
                View tweet {index + 1} on X
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function subscribeToHydration() {
  return () => null;
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

type FormatFullDateOptions = {
  readonly date: Date;
};

function formatFullDate(options: FormatFullDateOptions) {
  const { date } = options;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
