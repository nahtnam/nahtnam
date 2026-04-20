import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";

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
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <Muted className="font-mono text-[0.68rem] tracking-[0.24em] uppercase">
        My latest post
      </Muted>
      <Link
        className="group block w-full"
        params={{ slug: post.slug }}
        to="/blog/$slug"
      >
        <Card className="gap-0 overflow-hidden border-border/75 bg-background/82 py-0 text-left transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/26 group-hover:shadow-[0_30px_70px_-44px_color-mix(in_srgb,var(--color-primary)_24%,transparent)]">
          <CardHeader className="gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <Badge
              className="w-fit px-2 py-0.75 text-[0.62rem]"
              variant="secondary"
            >
              {post.category.name}
            </Badge>
            <CardTitle className="text-pretty text-[1.2rem] leading-[1.08] text-foreground transition-colors group-hover:text-primary sm:text-[1.35rem]">
              {post.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="rounded-[1.35rem] border border-border/55 bg-accent/18 px-3.5 py-3.5 sm:px-4">
              <p className="line-clamp-3 text-sm leading-6 text-foreground/74 sm:text-[0.96rem]">
                {post.excerpt}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
