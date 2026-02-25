import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
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

export function Navbar() {
  const { data: user } = useSuspenseQuery(
    convexQuery(api.auth.queries.safeGetCurrentUser),
  );

  const menu: MenuItem[] = user
    ? [
        {
          title: "Dashboard",
          url: "/app",
        },
        {
          isExternal: true,
          title: "Sign Out",
          url: "/api/auth/sign-out",
        },
      ]
    : [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Get Started",
          url: "/get-started",
        },
      ];

  return (
    <header className="border-b py-4">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between">
          <Link className="font-bold text-xl" to={user ? "/app" : "/"}>
            {appName}
          </Link>

          <Menubar className="hidden border-none bg-transparent shadow-none md:flex">
            {menu.map((item) => (
              <Button key={item.title} asChild size="sm" variant="ghost">
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
                variant="ghost"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{appName}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col px-2">
                {menu.map((item) => (
                  <SheetClose key={item.title} asChild>
                    <Button className="justify-start" variant="ghost">
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
