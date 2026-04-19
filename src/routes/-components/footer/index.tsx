import { Muted } from "@/components/ui/typography";
import { appName } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 pb-6 pt-10">
      <div className="container mx-auto">
        <div className="rounded-4xl border border-border/70 bg-background/72 px-6 py-6 text-center shadow-[0_20px_40px_-34px_color-mix(in_srgb,var(--color-foreground)_28%,transparent)] backdrop-blur-sm">
          <Muted className="font-mono text-[0.7rem] tracking-[0.26em] uppercase">
            &copy; {year} {appName}
          </Muted>
        </div>
      </div>
    </footer>
  );
}
