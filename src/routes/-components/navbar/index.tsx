import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menubar } from "@/components/ui/menubar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { appName } from "@/lib/config";

type MenuItem = {
  title: string;
  url: string;
  isExternal?: boolean;
};

const menu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Experience", url: "/experience" },
  { title: "Blog", url: "/blog" },
  { title: "Travel", url: "/travel" },
  { title: "Contact", url: "/contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between rounded-full border border-border/70 bg-background/78 px-4 py-3 shadow-[0_24px_50px_-36px_color-mix(in_srgb,var(--color-foreground)_35%,transparent)] backdrop-blur-xl md:px-5">
          <Link
            className="inline-flex items-center gap-3 text-foreground"
            to="/"
          >
            <Avatar className="size-11 border border-white/85 shadow-[0_18px_32px_-20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]">
              <AvatarImage alt="Manthan" src="/assets/images/me.avif" />
            </Avatar>
            <span className="font-serif text-2xl tracking-[-0.02em]">
              {appName}
            </span>
          </Link>

          <Menubar className="hidden border-none bg-transparent p-0 shadow-none md:flex">
            {menu.map((item) => (
              <Button
                key={item.title}
                asChild
                className="text-muted-foreground hover:text-foreground"
                size="sm"
                variant="ghost"
              >
                {item.isExternal ? (
                  <a href={item.url}>{item.title}</a>
                ) : (
                  <Link to={item.url}>{item.title}</Link>
                )}
              </Button>
            ))}
          </Menubar>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Toggle menu"
                className="md:hidden"
                size="icon"
                variant="outline"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="border-l-border/70 bg-background/95 backdrop-blur-xl"
              side="right"
            >
              <SheetHeader className="px-6 pt-8">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 border border-white/85 shadow-[0_18px_32px_-20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]">
                    <AvatarImage alt="Manthan" src="/assets/images/me.avif" />
                  </Avatar>
                  <SheetTitle className="font-serif text-3xl font-normal tracking-[-0.02em]">
                    {appName}
                  </SheetTitle>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4 pb-6">
                {menu.map((item) => (
                  <SheetClose key={item.title} asChild>
                    <Button className="justify-start" size="lg" variant="ghost">
                      {item.isExternal ? (
                        <a href={item.url}>{item.title}</a>
                      ) : (
                        <Link to={item.url}>{item.title}</Link>
                      )}
                    </Button>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
