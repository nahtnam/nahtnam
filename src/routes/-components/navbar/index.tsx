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

interface MenuItem {
  title: string;
  url: string;
  isExternal?: boolean;
}

const menu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Experience", url: "/experience" },
  { title: "Blog", url: "/blog" },
  { title: "Travel", url: "/travel" },
  { title: "Contact", url: "/contact" },
];

export function Navbar() {
  return (
    <header className="container mx-auto border-b py-4">
      <nav className="flex items-center justify-between">
        <Link className="font-bold text-xl" to="/">
          {appName}
        </Link>

        <Menubar className="hidden border-none bg-transparent shadow-none md:flex">
          {menu.map((item) => (
            <Button
              key={item.title}
              nativeButton={false}
              render={
                item.isExternal ? (
                  <a href={item.url}>{item.title}</a>
                ) : (
                  <Link to={item.url}>{item.title}</Link>
                )
              }
              size="sm"
              variant="ghost"
            />
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
            <Menu />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{appName}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col px-2">
              {menu.map((item) => (
                <SheetClose
                  key={item.title}
                  render={<Button className="justify-start" variant="ghost" />}
                >
                  {item.isExternal ? (
                    <a href={item.url}>{item.title}</a>
                  ) : (
                    <Link to={item.url}>{item.title}</Link>
                  )}
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
