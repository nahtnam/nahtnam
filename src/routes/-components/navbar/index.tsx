import { Link } from "@tanstack/react-router";
import type { User } from "better-auth";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { appName } from "@/config/app";

type NavbarProps = {
  user: User | null;
};

export function Navbar(props: NavbarProps) {
  const { user } = props;
  const [isOpen, setIsOpen] = useState(false);

  const links = user
    ? [
        { label: "Dashboard", to: "/" },
        { external: true, label: "Sign Out", to: "/api/auth/sign-out" },
      ]
    : [{ label: "Home", to: "/" }];

  return (
    <header className="container mx-auto px-6 py-6">
      <nav className="flex items-center justify-between">
        <Link
          className="font-bold font-mono text-lg transition-colors hover:text-indigo-500"
          to="/"
        >
          {appName}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) =>
            link.external ? (
              <a
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                href={link.to}
                key={link.label}
              >
                {link.label}
              </a>
            ) : (
              <Link
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                key={link.label}
                to={link.to}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="mt-4 flex flex-col gap-2 border-border/50 border-t pt-4 md:hidden">
          {links.map((link) =>
            link.external ? (
              <a
                className="py-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                href={link.to}
                key={link.label}
              >
                {link.label}
              </a>
            ) : (
              <Link
                className="py-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                key={link.label}
                onClick={() => setIsOpen(false)}
                to={link.to}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      ) : null}
    </header>
  );
}
