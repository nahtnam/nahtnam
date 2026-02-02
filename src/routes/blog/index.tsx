import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/routes/-shadcn/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/routes/-shadcn/components/ui/tooltip";
import { H1, Lead, Small } from "@/routes/-shadcn/components/ui/typography";
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

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
  loader: async ({ context }) => {
    const { posts } = await context.queryClient.fetchQuery(
      orpcTanstackQueryClient.blog.listPosts.queryOptions()
    );
    return { posts };
  },
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
            className="group flex flex-col gap-1 rounded-lg border p-3 transition-all hover:border-foreground/20 hover:shadow-sm"
            key={post.slug}
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
                <TooltipTrigger
                  className="shrink-0 cursor-default font-normal text-muted-foreground text-xs"
                  render={<Small />}
                >
                  {formatRelativeDate(post.publishedAt)}
                </TooltipTrigger>
                <TooltipContent>
                  {formatFullDate(post.publishedAt)}
                </TooltipContent>
              </Tooltip>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
