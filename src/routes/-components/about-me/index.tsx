import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/components/ui/typography";

export function AboutMe() {
  return (
    <>
      <Lead className="max-w-md text-center">
        Software Engineer with experience at high-growth startups. Building
        things that matter.
      </Lead>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge className="h-auto gap-2 px-4 py-2 text-sm" variant="secondary">
          <Rocket className="size-4" />
          indie hacker
        </Badge>
        <Badge className="h-auto gap-2 px-4 py-2 text-sm" variant="secondary">
          <span className="text-base">🏸</span>
          badminton player
        </Badge>
      </div>
    </>
  );
}
