import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { appName, appUrl } from "@/lib/config";

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
  const { signOut, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link
          className="inline-flex items-center gap-2.5 text-foreground"
          to="/"
        >
          <Avatar className="size-8 rounded-full">
            <AvatarImage alt="Manthan" src="/assets/images/me.avif" />
          </Avatar>
          <span className="font-serif text-xl tracking-[-0.02em]">
            {appName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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
          {user ? (
            <>
              <span className="mx-1 h-5 w-px bg-border" />
              <Button
                asChild
                className="text-muted-foreground hover:text-foreground"
                size="sm"
                variant="ghost"
              >
                <Link to="/admin">Admin</Link>
              </Button>
              <Button
                className="text-muted-foreground hover:text-foreground"
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => {
                  void signOut({ returnTo: appUrl });
                }}
              >
                Sign Out
              </Button>
            </>
          ) : null}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Toggle menu"
              className="md:hidden"
              size="icon"
              variant="ghost"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="border-l-border bg-background" side="right">
            <SheetHeader className="border-b border-border px-6 py-5">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-9 rounded-full">
                  <AvatarImage alt="Manthan" src="/assets/images/me.avif" />
                </Avatar>
                <SheetTitle className="font-serif text-2xl font-normal tracking-[-0.02em]">
                  {appName}
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-3 py-4">
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
              {user ? (
                <>
                  <div className="my-2 h-px bg-border" />
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="justify-start"
                      size="lg"
                      variant="ghost"
                    >
                      <Link to="/admin">Admin</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="justify-start"
                      size="lg"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        void signOut({ returnTo: appUrl });
                      }}
                    >
                      Sign Out
                    </Button>
                  </SheetClose>
                </>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
