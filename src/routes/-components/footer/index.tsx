import { Muted } from "@/components/ui/typography";
import { appName } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-8">
      <div className="container mx-auto">
        <Muted className="text-center">
          &copy; {year} {appName}
        </Muted>
      </div>
    </footer>
  );
}
