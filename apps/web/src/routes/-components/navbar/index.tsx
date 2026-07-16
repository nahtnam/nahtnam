import { usePostHog } from "@posthog/react";
import { appUrl } from "@repo/config/app";
import { clientEnv } from "@repo/config/env/client";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AnimatedIdentity } from "../animated-identity";

type PublicPath =
  | "/"
  | "/admin"
  | "/blog"
  | "/contact"
  | "/experience"
  | "/travel";

type MenuItem = {
  label: string;
  to: PublicPath;
};

type MenuItemProps = {
  children: ReactNode;
  isExact?: boolean;
  onNavigate?: () => void;
  to: PublicPath;
};

const menuItems: MenuItem[] = [
  { label: "Home", to: "/" },
  { label: "Experience", to: "/experience" },
  { label: "Blog", to: "/blog" },
  { label: "Travel", to: "/travel" },
  { label: "Contact", to: "/contact" },
];

function handleMenuNavigate() {
  document.querySelector<HTMLElement>("#site-navigation")?.hidePopover();
}

export function Navbar() {
  const { signOut, user } = useAuth();
  const posthog = usePostHog();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 48rem)");

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        handleMenuNavigate();
      }
    }

    desktopViewport.addEventListener("change", handleViewportChange);

    return () => {
      desktopViewport.removeEventListener("change", handleViewportChange);
    };
  }, []);

  function handleSignOut() {
    handleMenuNavigate();

    if (clientEnv.VITE_POSTHOG_KEY) {
      posthog.reset();
    }

    void signOut({ returnTo: appUrl });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100">
      <nav
        aria-label="Primary navigation"
        className="navbar container min-h-18"
      >
        <div className="navbar-start">
          <Link
            aria-label="Go to the home page — Manthan, also known as @nahtnam"
            className="inline-flex min-h-11 items-center"
            to="/"
          >
            <AnimatedIdentity
              className="block min-w-[8ch] text-lg font-semibold tracking-[-0.03em] text-primary"
              initialIdentity="@nahtnam"
            />
          </Link>
        </div>

        <div className="navbar-end hidden gap-1 md:flex">
          {menuItems.map((item) => (
            <DesktopMenuItem
              key={item.to}
              isExact={item.to === "/"}
              to={item.to}
            >
              {item.label}
            </DesktopMenuItem>
          ))}
          {user ? (
            <>
              <span aria-hidden="true" className="mx-2 h-5 w-px bg-base-300" />
              <DesktopMenuItem to="/admin">Admin</DesktopMenuItem>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleSignOut}
                type="button"
              >
                Sign Out
              </button>
            </>
          ) : null}
        </div>

        <div className="navbar-end shrink-0 md:hidden">
          <button
            aria-controls="site-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="btn btn-ghost btn-square size-12 touch-manipulation"
            popoverTarget="site-navigation"
            type="button"
          >
            {isMenuOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
          <ul
            className="site-navigation dropdown menu fixed inset-x-3 top-20 bottom-auto m-0 max-h-[calc(100dvh-6rem)] w-auto max-w-none overflow-y-auto overscroll-contain rounded-box border border-base-300 bg-base-100 p-2 shadow-xl sm:right-4 sm:left-auto sm:w-80 md:hidden"
            id="site-navigation"
            onToggle={(event) => {
              setIsMenuOpen(event.currentTarget.matches(":popover-open"));
            }}
            popover="auto"
          >
            <li className="menu-title px-3 py-2 text-xs font-semibold tracking-[0.12em] text-base-content/60 uppercase">
              Navigate
            </li>
            {menuItems.map((item) => (
              <MobileMenuItem
                key={item.to}
                isExact={item.to === "/"}
                onNavigate={handleMenuNavigate}
                to={item.to}
              >
                {item.label}
              </MobileMenuItem>
            ))}
            {user ? (
              <>
                <li className="my-1 border-t border-base-300" />
                <MobileMenuItem onNavigate={handleMenuNavigate} to="/admin">
                  Admin
                </MobileMenuItem>
                <li>
                  <button
                    className="min-h-12 touch-manipulation px-4 text-base"
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      </nav>
    </header>
  );
}

function DesktopMenuItem(props: MenuItemProps) {
  const { children, isExact, to } = props;

  return (
    <Link
      activeOptions={{ exact: isExact, includeSearch: false }}
      activeProps={{
        className: "text-base-content after:scale-x-100",
      }}
      className="relative inline-flex min-h-11 items-center px-3 text-sm font-medium text-base-content/60 transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-base-content after:transition-transform hover:text-base-content"
      to={to}
    >
      {children}
    </Link>
  );
}

function MobileMenuItem(props: MenuItemProps) {
  const { children, isExact, onNavigate, to } = props;

  return (
    <li>
      <Link
        activeOptions={{ exact: isExact, includeSearch: false }}
        activeProps={{ className: "menu-active" }}
        className="min-h-12 touch-manipulation px-4 text-base"
        onClick={onNavigate}
        to={to}
      >
        {children}
      </Link>
    </li>
  );
}
