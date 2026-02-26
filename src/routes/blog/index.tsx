/* eslint-disable sort-keys */
import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H1, Lead, Small } from "@/components/ui/typography";

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

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
  async loader({ context }) {
    const posts = await context.queryClient.fetchQuery(
      convexQuery(api.blog.queries.listPosts, {}),
    );
    return { posts };
  },
  head: () => ({
    meta: [
      {
        content: "Blog | Manthan (@nahtnam)",
        title: "Blog | Manthan (@nahtnam)",
      },
      {
        content:
          "Writing about software engineering, startups, personal finance, and product reviews.",
        name: "description",
      },
      {
        content: "Blog | Manthan (@nahtnam)",
        property: "og:title",
      },
      {
        content:
          "Writing about software engineering, startups, personal finance, and product reviews.",
        property: "og:description",
      },
    ],
  }),
});

function BlogIndexPage() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12">
        <H1 className="font-semibold text-3xl">Blog</H1>
        <Lead className="mt-2 text-base">
          Writing about software, startups, personal finance, and the occasional
          product review.
        </Lead>
      </div>

      <div className="grid gap-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            className="group flex flex-col gap-1 rounded-lg border p-3 transition-all hover:border-foreground/20 hover:shadow-sm"
            params={{ slug: post.slug }}
            to="/blog/$slug"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-semibold leading-snug transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              <Badge
                className="shrink-0 px-1.5 py-0 text-xs"
                variant="secondary"
              >
                {post.category.name}
              </Badge>
            </div>

            <div className="flex items-end justify-between gap-4">
              <p className="line-clamp-1 text-muted-foreground text-sm">
                {post.excerpt}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Small className="shrink-0 cursor-default font-normal text-muted-foreground text-xs">
                    {formatRelativeDate(new Date(post.publishedAt))}
                  </Small>
                </TooltipTrigger>
                <TooltipContent>
                  {formatFullDate(new Date(post.publishedAt))}
                </TooltipContent>
              </Tooltip>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
