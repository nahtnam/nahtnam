/* eslint-disable sort-keys */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { api } from "convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Markdown from "react-markdown";
import { EmbeddedTweet } from "react-tweet";
import type { Tweet } from "react-tweet/api";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBlogMarkdownContent } from "@/lib/blog/markdown";
import { H1, Muted } from "@/components/ui/typography";
import { appUrl } from "@/lib/config";
import {
  canonicalUrl,
  createSeo,
  ogImageUrl,
  siteImage,
  siteTitle,
} from "@/lib/seo";

const getPost = createConvexRouteQuery(api.blog.queries.getPost);

function formatRelativeDate(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const Route = createFileRoute("/blog/$slug/")({
  component: BlogPostPage,
  async loader({ context, params }) {
    const post = await getPost.fetchQuery(context.queryClient, {
      slug: params.slug,
    });
    if (!post) {
      throw notFound();
    }

    return { post };
  },
  head({ loaderData, params }) {
    const post = loaderData?.post;
    const title = post
      ? `${post.title} | ${siteTitle}`
      : `Blog Post | ${siteTitle}`;

    return createSeo({
      description: post?.excerpt ?? "A blog post by Manthan (@nahtnam).",
      imageLabel: post?.category.name ?? "Writing",
      path: `/blog/${params.slug}`,
      publishedAt: post?.publishedAt,
      section: post?.category.name,
      socialTitle: post?.title ?? "Blog Post",
      title,
      type: "article",
    });
  },
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post } = getPost.useSuspenseQuery({ slug });
  if (!post) {
    return null;
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.publishedAt).toISOString(),
    articleSection: post.category.name,
    url: canonicalUrl(`/blog/${post.slug}`),
    image: ogImageUrl({
      description: post.excerpt,
      label: post.category.name,
      path: `/blog/${post.slug}`,
      title: post.title,
    }),
    mainEntityOfPage: canonicalUrl(`/blog/${post.slug}`),
    author: {
      "@type": "Person",
      name: "Manthan",
      url: appUrl,
      image: siteImage,
    },
    publisher: {
      "@type": "Person",
      name: "Manthan",
      url: appUrl,
      image: siteImage,
    },
  };

  const kind = post.kind ?? "markdown";
  const markdownContent = getBlogMarkdownContent(post.contentPath) ?? "";

  return (
    <div className="page-shell page-shell-article">
      {/* eslint-disable react/no-danger */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />
      {/* eslint-enable react/no-danger */}
      <Button
        asChild
        className="mb-10 -ml-2 text-muted-foreground hover:text-foreground"
        size="sm"
        variant="ghost"
      >
        <Link to="/blog">
          <ArrowLeft className="size-4" />
          Back to blog
        </Link>
      </Button>

      <div className="mb-10 border-b border-border pb-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[0.64rem] font-medium tracking-[0.18em] text-primary uppercase">
            {post.category.name}
          </span>
          <span className="h-3 w-px bg-border" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Muted className="cursor-default font-mono text-[0.66rem] tracking-[0.14em] uppercase">
                {formatRelativeDate(new Date(post.publishedAt))}
              </Muted>
            </TooltipTrigger>
            <TooltipContent>
              {formatFullDate(new Date(post.publishedAt))}
            </TooltipContent>
          </Tooltip>
        </div>

        <H1 className="text-balance">{post.title}</H1>
      </div>

      <article className="prose-editorial">
        {kind === "x" ? <TweetThread tweets={post.tweets ?? []} /> : null}
        {kind === "markdown" ? <Markdown>{markdownContent}</Markdown> : null}
      </article>
    </div>
  );
}

type TweetThreadProps = {
  readonly tweets: ReadonlyArray<{
    readonly id: string;
    readonly sourceUrl: string;
    readonly tweet: unknown;
  }>;
};

function TweetThread(props: TweetThreadProps) {
  const { tweets } = props;

  return (
    <ol
      className="tweet-thread not-prose mx-auto flex max-w-[660px] flex-col"
      data-theme="light"
    >
      {tweets.map(({ id, sourceUrl, tweet }, index) => (
        <li
          key={id}
          className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 pb-8 last:pb-0 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-4"
        >
          <div className="relative flex justify-center">
            {index < tweets.length - 1 ? (
              <span className="absolute top-6 bottom-[-0.5rem] w-px bg-gradient-to-b from-primary/38 via-border to-border sm:top-10" />
            ) : null}
            <span className="relative z-10 flex size-6 items-center justify-center rounded-full border border-primary/20 bg-background font-mono font-semibold text-[0.56rem] text-primary shadow-[0_12px_30px_-24px_color-mix(in_srgb,var(--color-primary)_65%,transparent)] sm:size-10 sm:text-[0.68rem]">
              {index + 1}
            </span>
          </div>
          <div className="min-w-0">
            <a
              className="sr-only"
              href={sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              View tweet on X
            </a>
            <EmbeddedTweet tweet={tweet as Tweet} />
          </div>
        </li>
      ))}
    </ol>
  );
}
