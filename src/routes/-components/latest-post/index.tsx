import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/routes/-shadcn/components/ui/badge";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

type LatestPostProps = {
  post: {
    slug: string;
    title: string;
    category: {
      name: string;
    };
  };
};

export function LatestPost({ post }: LatestPostProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Muted className="text-xs">Latest from the blog</Muted>
      <Link
        className="group flex items-center gap-3 rounded-full border px-4 py-2 transition-all hover:border-foreground/20 hover:shadow-sm"
        params={{ slug: post.slug }}
        to="/blog/$slug"
      >
        <Badge className="px-1.5 py-0 text-xs" variant="secondary">
          {post.category.name}
        </Badge>
        <Muted className="line-clamp-1 text-sm transition-colors group-hover:text-foreground">
          {post.title}
        </Muted>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
