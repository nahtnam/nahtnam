import { api } from "@repo/backend/api";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQueries } from "convex-route-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightIcon } from "lucide-react";

import { createSeo, pageSeo } from "@/lib/seo";

const { listPosts } = createConvexRouteQueries({
  listPosts: api.blog.queries.listPosts,
});

export const Route = createFileRoute("/_public/blog/")({
  component: BlogIndexPage,
  loader(context) {
    return listPosts.prefetchRoute(context, {});
  },
  head: () => createSeo(pageSeo.blog),
});

function BlogIndexPage() {
  const { data: posts } = listPosts.useSuspenseRouteQuery(Route);
  const hasSinglePost = posts.length === 1;

  return (
    <div className="page-shell page-shell-article">
      <header className="grid gap-8 border-b border-base-content/15 pb-10 sm:pb-14 md:grid-cols-[minmax(0,0.8fr)_minmax(20rem,1.2fr)] md:items-end md:gap-12">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.18em] text-base-content/60 uppercase">
            Writing
          </p>
          <h1 className="heading mt-3 text-6xl leading-none tracking-[-0.055em] sm:text-7xl">
            Blog
          </h1>
        </div>
        <p className="max-w-xl text-pretty text-lg leading-8 text-base-content/65 md:justify-self-end">
          Writing about software, startups, personal finance, and the occasional
          product review.
        </p>
      </header>

      <ol className="border-b border-base-content/15">
        {posts.map((post) => {
          const publishedAt = new Date(post.publishedAt);

          return (
            <li
              key={post.slug}
              className="border-t border-base-content/15 first:border-t-0"
            >
              <Link
                className={`group grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-5 py-9 transition-colors hover:text-base-content sm:grid-cols-[8rem_minmax(0,1fr)_2rem] sm:gap-x-8 sm:py-11 ${hasSinglePost ? "sm:min-h-[24rem] sm:items-center" : ""}`}
                params={{ slug: post.slug }}
                to="/blog/$slug"
              >
                <div className="col-span-2 flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.08em] text-base-content/60 sm:col-span-1 sm:block sm:pt-1">
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

                <article className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] font-semibold tracking-[0.14em] text-base-content/60 uppercase">
                    <span>{post.category.name}</span>
                    {(post.kind ?? "markdown") === "x" ? (
                      <>
                        <span aria-hidden="true">/</span>
                        <span>X thread</span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="heading mt-4 text-3xl leading-tight tracking-[-0.04em] transition-colors [overflow-wrap:anywhere] group-hover:text-primary sm:text-4xl">
                    {post.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-pretty leading-7 text-base-content/60">
                    {post.excerpt}
                  </p>
                </article>

                <ArrowRightIcon className="mt-1 size-5 self-start text-base-content/35 transition group-hover:translate-x-1 group-hover:text-primary sm:mt-0 sm:self-center" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
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
