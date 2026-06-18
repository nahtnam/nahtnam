import { Muted } from "@/components/ui/typography";

export function ContactFooter() {
  return (
    <div className="mt-10 flex items-center justify-center gap-3 border-t border-border pt-6">
      <span className="h-px w-8 bg-border" />
      <Muted className="font-mono text-[0.66rem] tracking-[0.2em] uppercase">
        Looking forward to hearing from you
      </Muted>
      <span className="h-px w-8 bg-border" />
    </div>
  );
}
