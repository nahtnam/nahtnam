import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

type LatestPostProps = {
  readonly post: {
    excerpt: string;
    slug: string;
    title: string;
    category: {
      name: string;
    };
  };
};

export function LatestPost({ post }: LatestPostProps) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <p className="font-mono text-[0.66rem] tracking-[0.22em] text-muted-foreground uppercase">
        Latest writing
      </p>
      <Link
        className="group block w-full rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
        params={{ slug: post.slug }}
        to="/blog/$slug"
      >
        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono text-[0.66rem] font-medium tracking-[0.18em] text-primary uppercase">
            {post.category.name}
          </span>
        </div>
        <h3 className="font-serif text-2xl leading-tight tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          Read post
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
