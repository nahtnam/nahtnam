import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/ui/typography";

type LatestPostProps = {
  readonly post: {
    slug: string;
    title: string;
    category: {
      name: string;
    };
  };
};

export function LatestPost({ post }: LatestPostProps) {
  return (
    <div className="flex flex-col items-center gap-3 lg:items-start">
      <Muted className="font-mono text-[0.68rem] tracking-[0.24em] uppercase">
        Latest from the blog
      </Muted>
      <Link
        className="group flex w-full items-center gap-3 rounded-[1.7rem] border border-border/75 bg-card/85 px-4 py-3 shadow-[0_18px_30px_-28px_color-mix(in_srgb,var(--color-foreground)_30%,transparent)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_40px_-26px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]"
        params={{ slug: post.slug }}
        to="/blog/$slug"
      >
        <Badge className="px-2 py-1 text-[0.68rem]" variant="secondary">
          {post.category.name}
        </Badge>
        <Muted className="line-clamp-1 flex-1 text-sm text-foreground/76 transition-colors group-hover:text-foreground">
          {post.title}
        </Muted>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
