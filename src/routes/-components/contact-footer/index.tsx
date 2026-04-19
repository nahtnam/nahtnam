import { Sparkles } from "lucide-react";
import { Muted } from "@/components/ui/typography";

export function ContactFooter() {
  return (
    <div className="mt-8 text-center">
      <Muted className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.22em] uppercase">
        <Sparkles className="size-4" />
        Looking forward to hearing from you
        <Sparkles className="size-4" />
      </Muted>
    </div>
  );
}
