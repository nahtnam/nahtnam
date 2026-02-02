import { Sparkles } from "lucide-react";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

export function ContactFooter() {
  return (
    <div className="mt-8 text-center">
      <Muted className="inline-flex items-center gap-2">
        <Sparkles className="size-4" />
        Looking forward to hearing from you
        <Sparkles className="size-4" />
      </Muted>
    </div>
  );
}
