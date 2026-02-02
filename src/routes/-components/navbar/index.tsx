import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { appName } from "@/config/app";
import { Button } from "@/routes/-shadcn/components/ui/button";
import { Menubar } from "@/routes/-shadcn/components/ui/menubar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/routes/-shadcn/components/ui/sheet";

const links = [
  { label: "Home", to: "/" },
  { label: "Experience", to: "/experience" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export function Navbar() {
  return (
    <header className="container mx-auto px-6 py-6 print:hidden">
      <nav className="flex items-center justify-between">
        <Link
          className="font-bold font-mono text-lg transition-colors hover:text-indigo-500"
          to="/"
        >
          {appName}
        </Link>

        <Menubar className="hidden border-none bg-transparent shadow-none md:flex">
          {links.map((link) => (
            <Button
              className="text-muted-foreground hover:text-foreground"
              key={link.label}
              render={<Link to={link.to} />}
              size="sm"
              variant="ghost"
            >
              {link.label}
            </Button>
          ))}
        </Menubar>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                aria-label="Toggle menu"
                className="md:hidden"
                size="icon"
                variant="ghost"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{appName}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 px-4">
              {links.map((link) => (
                <SheetClose key={link.label} render={<Link to={link.to} />}>
                  <Button
                    className="w-full justify-start text-muted-foreground"
                    variant="ghost"
                  >
                    {link.label}
                  </Button>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
