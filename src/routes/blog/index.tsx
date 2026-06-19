/* eslint-disable sort-keys */
import { createFileRoute, Link } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { api } from "convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H1, Lead, Small } from "@/components/ui/typography";
import { createSeo, pageSeo } from "@/lib/seo";

const listPosts = createConvexRouteQuery(api.blog.queries.listPosts);

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
    await listPosts.prefetchQuery(context.queryClient);
  },
  head: () => createSeo(pageSeo.blog),
});

function BlogIndexPage() {
  const { data: posts } = listPosts.useSuspenseQuery();

  return (
    <div className="page-shell page-shell-narrow">
      <div className="page-intro mb-12">
        <span className="eyebrow mb-4">Writing</span>
        <H1>Blog</H1>
        <Lead className="mt-4 max-w-2xl text-base">
          Writing about software, startups, personal finance, and the occasional
          product review.
        </Lead>
      </div>

      <div className="divide-y divide-border">
        {posts.map((post) => (
          <Link
            key={post.slug}
            className="group block rounded-lg px-4 py-7 transition-colors hover:bg-accent/40"
            params={{ slug: post.slug }}
            to="/blog/$slug"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.64rem] font-medium tracking-[0.18em] text-primary uppercase">
                {post.category.name}
              </span>
              {(post.kind ?? "markdown") === "x" ? (
                <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.58rem] tracking-wide text-muted-foreground uppercase">
                  X thread
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h2>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="line-clamp-1 flex-1 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Small className="shrink-0 cursor-default font-mono text-[0.64rem] tracking-wide text-muted-foreground uppercase">
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
