import { Badge } from "@/components/ui/badge";
import { Lead } from "@/components/ui/typography";

export function AboutMe() {
  return (
    <>
      <Lead className="max-w-2xl text-balance text-center text-foreground/76">
        Software Engineer with experience at high-growth startups. Building
        things that matter.
      </Lead>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge
          className="h-auto min-w-[10.75rem] justify-center gap-2 border-border/70 bg-background/78 px-4 py-2 text-[0.72rem] text-foreground normal-case tracking-normal"
          variant="secondary"
        >
          <span className="text-base">🚀</span>
          indie hacker
        </Badge>
        <Badge
          className="h-auto min-w-[10.75rem] justify-center gap-2 border-border/70 bg-background/78 px-4 py-2 text-[0.72rem] text-foreground normal-case tracking-normal"
          variant="secondary"
        >
          <span className="text-base">🏸</span>
          badminton player
        </Badge>
      </div>
    </>
  );
}
