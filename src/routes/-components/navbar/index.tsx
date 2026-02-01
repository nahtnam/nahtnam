import { Link } from "@tanstack/react-router";
import type { User } from "better-auth";
import { Menu } from "lucide-react";
import { appName } from "@/config/app";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/routes/-shadcn/components/ui/accordion";
import { Button } from "@/routes/-shadcn/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/routes/-shadcn/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/routes/-shadcn/components/ui/sheet";
import { Logo } from "./logo";

type MenuItem = {
  title: string;
  url: string;
  isExternal?: boolean;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
};

type NavbarProps = {
  user: User | null;
};

export function Navbar(props: NavbarProps) {
  const { user } = props;

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
    <div className="container mx-auto border-b py-4">
      {/* Desktop Menu */}
      <nav className="hidden items-center justify-between lg:flex">
        <div className="flex items-center gap-6">
          <Logo user={user} />
        </div>
        <div className="flex gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {menu.map((item) => renderMenuItem(item))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between">
          <Logo user={user} />
          <Sheet>
            <SheetTrigger render={<Button size="icon" variant="outline" />}>
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{appName}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-4">
                <Accordion className="flex w-full flex-col gap-4">
                  {menu.map((item) => renderMobileMenuItem(item))}
                </Accordion>
              </div>{" "}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink
              className="w-80"
              key={subItem.title}
              render={<SubMenuLink item={subItem} />}
            />
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-muted hover:text-accent-foreground"
        render={
          // biome-ignore lint/a11y/useAnchorContent: baseui
          item.isExternal ? <a href={item.url} /> : <Link to={item.url} />
        }
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem className="border-b-0" key={item.title} value={item.title}>
        <AccordionTrigger className="py-0 font-semibold text-md hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink item={subItem} key={subItem.title} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  const Component = item.isExternal ? "a" : Link;

  return (
    <Component
      className="font-semibold text-md"
      key={item.title}
      {...(item.isExternal ? { href: item.url } : { to: item.url })}
    >
      {item.title}
    </Component>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  const Component = item.isExternal ? "a" : Link;
  return (
    <Component
      className="flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
      {...(item.isExternal ? { href: item.url } : { to: item.url })}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="font-semibold text-sm">{item.title}</div>
        {item.description ? (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        ) : null}
      </div>
    </Component>
  );
};
