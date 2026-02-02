import { appName } from "@/config/app";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-border/30 border-t py-8 print:hidden">
      <div className="container mx-auto px-6">
        <Muted className="text-center text-muted-foreground/40 text-xs">
          &copy; {year} {appName}
        </Muted>
      </div>
    </footer>
  );
}
