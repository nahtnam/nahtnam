import { appName } from "@/config/app";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-border/30 border-t py-8">
      <div className="container mx-auto px-6">
        <p className="text-center text-muted-foreground/40 text-xs">
          &copy; {year} {appName}
        </p>
      </div>
    </footer>
  );
}
