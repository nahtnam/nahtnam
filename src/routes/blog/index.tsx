import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H1, Lead, Small } from "@/components/ui/typography";
import { appUrl } from "@/lib/config";

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
  head: () => ({
    links: [
      {
        href: `${appUrl}/blog`,
        rel: "canonical",
      },
    ],
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
        content: `${appUrl}/blog`,
        property: "og:url",
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
  const { data: posts } = useSuspenseQuery(
    convexQuery(api.blog.queries.listPosts, {}),
  );

  return (
    <div className="page-shell page-shell-narrow">
      <div className="page-intro mb-10">
        <span className="eyebrow mb-4">Writing</span>
        <H1>Blog</H1>
        <Lead className="mt-4 max-w-2xl text-base">
          Writing about software, startups, personal finance, and the occasional
          product review.
        </Lead>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-[2rem] border border-border/80 bg-card/92 p-5 shadow-[0_22px_50px_-40px_color-mix(in_srgb,var(--color-foreground)_36%,transparent)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_30px_60px_-38px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
            params={{ slug: post.slug }}
            to="/blog/$slug"
          >
            <div className="absolute inset-y-5 left-0 w-1 rounded-full bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl leading-snug tracking-[-0.02em] transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              <Badge
                className="shrink-0 px-2 py-1 text-[0.68rem]"
                variant="secondary"
              >
                {post.category.name}
              </Badge>
            </div>

            <div className="flex items-end justify-between gap-4">
              <p className="line-clamp-2 text-muted-foreground text-sm leading-6">
                {post.excerpt}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Small className="shrink-0 cursor-default font-mono font-medium text-[0.68rem] text-muted-foreground uppercase">
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
