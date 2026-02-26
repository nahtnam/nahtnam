/* eslint-disable sort-keys */
import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Markdown from "react-markdown";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H1, Muted } from "@/components/ui/typography";

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
    const post = await context.queryClient.fetchQuery(
      convexQuery(api.blog.queries.getPost, { slug: params.slug }),
    );
    if (!post) {
      throw notFound();
    }

    return { post };
  },
  head({ loaderData }) {
    const post = loaderData?.post;
    return {
      meta: [
        {
          content: post
            ? `${post.title} | Manthan (@nahtnam)`
            : "Blog Post | Manthan (@nahtnam)",
          title: post
            ? `${post.title} | Manthan (@nahtnam)`
            : "Blog Post | Manthan (@nahtnam)",
        },
        {
          content: post?.excerpt ?? "",
          name: "description",
        },
        {
          content: post?.title ?? "Blog Post",
          property: "og:title",
        },
        {
          content: post?.excerpt ?? "",
          property: "og:description",
        },
        {
          content: "article",
          property: "og:type",
        },
        {
          content: post?.publishedAt
            ? new Date(post.publishedAt).toISOString()
            : "",
          property: "article:published_time",
        },
        {
          content: post?.category?.name ?? "",
          property: "article:section",
        },
        {
          content: "@nahtnam",
          property: "article:author",
        },
      ],
    };
  },
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
      <Button
        asChild
        className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        variant="ghost"
      >
        <Link to="/blog">
          <ArrowLeft className="mr-1 size-4" />
          Back
        </Link>
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <Badge className="font-medium text-xs" variant="secondary">
          {post.category.name}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Muted className="cursor-default">
              {formatRelativeDate(new Date(post.publishedAt))}
            </Muted>
          </TooltipTrigger>
          <TooltipContent>
            {formatFullDate(new Date(post.publishedAt))}
          </TooltipContent>
        </Tooltip>
      </div>

      <H1 className="mb-8 font-semibold text-3xl">{post.title}</H1>

      <article className="prose prose-neutral max-w-none">
        <Markdown>{post.content}</Markdown>
      </article>
    </div>
  );
}
