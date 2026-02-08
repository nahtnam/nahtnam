import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Markdown from "react-markdown";
import { Badge } from "@/routes/-shadcn/components/ui/badge";
import { Button } from "@/routes/-shadcn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/routes/-shadcn/components/ui/tooltip";
import { H1, Muted } from "@/routes/-shadcn/components/ui/typography";
import { orpcTanstackQueryClient } from "@/server/client";

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

// biome-ignore assist/source/useSortedKeys: tsr
export const Route = createFileRoute("/blog/$slug/")({
  component: BlogPostPage,
  loader: async ({ context, params }) => {
    const { post } = await context.queryClient.fetchQuery(
      orpcTanstackQueryClient.blog.getPost.queryOptions({
        input: { slug: params.slug },
      })
    );
    if (!post) {
      throw notFound();
    }
    return { post };
  },
  head: ({ loaderData }) => {
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
          content: post?.publishedAt?.toISOString() ?? "",
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
        className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        nativeButton={false}
        render={<Link to="/blog" />}
        variant="ghost"
      >
        <ArrowLeft className="mr-1 size-4" />
        Back
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <Badge className="font-medium text-xs" variant="secondary">
          {post.category.name}
        </Badge>
        <Tooltip>
          <TooltipTrigger className="cursor-default" render={<Muted />}>
            {formatRelativeDate(post.publishedAt)}
          </TooltipTrigger>
          <TooltipContent>{formatFullDate(post.publishedAt)}</TooltipContent>
        </Tooltip>
      </div>

      <H1 className="mb-8 font-semibold text-3xl">{post.title}</H1>

      <article className="prose prose-neutral max-w-none">
        <Markdown>{post.content}</Markdown>
      </article>
    </div>
  );
}
