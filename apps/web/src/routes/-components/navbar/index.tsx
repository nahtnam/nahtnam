import { usePostHog } from "@posthog/react";
import { appName } from "@repo/config/app";
import { clientEnv } from "@repo/config/env/client";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { MenuIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type MenuItemProps = {
  children: ReactNode;
  isExact?: boolean;
  to: "/" | "/app";
};

export function Navbar() {
  const { signOut, user } = useAuth();
  const posthog = usePostHog();
  const isAuthenticated = Boolean(user);
  const handleSignOut = () => {
    if (clientEnv.VITE_POSTHOG_KEY) {
      posthog.reset();
    }

    void signOut({ returnTo: "/" });
  };

  return (
    <header className="border-base-200 border-b bg-base-100">
      <nav className="navbar container mx-auto min-h-16">
        <div className="navbar-start">
          <Link
            className="text-xl font-semibold tracking-normal"
            to={isAuthenticated ? "/app" : "/"}
          >
            {appName}
          </Link>
        </div>

        <div className="navbar-end hidden gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <DesktopMenuItem to="/app">Dashboard</DesktopMenuItem>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleSignOut}
                type="button"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <DesktopMenuItem isExact to="/">
                Home
              </DesktopMenuItem>
              <a className="btn btn-ghost btn-sm" href="/api/auth/sign-in">
                Sign In
              </a>
              <a className="btn btn-primary btn-sm" href="/api/auth/sign-up">
                Sign Up
              </a>
            </>
          )}
        </div>

        <div className="navbar-end md:hidden">
          <button
            aria-label="Open menu"
            className="btn btn-ghost btn-square"
            popoverTarget="navbar-menu"
            style={{ anchorName: "--navbar-menu" } as CSSProperties}
            type="button"
          >
            <MenuIcon className="size-5" />
            <span className="sr-only">Open menu</span>
          </button>
          <ul
            className="dropdown dropdown-end menu w-48 rounded-box bg-base-100 shadow-sm"
            id="navbar-menu"
            popover="auto"
            style={{ positionAnchor: "--navbar-menu" } as CSSProperties}
          >
            {isAuthenticated ? (
              <>
                <MobileMenuItem to="/app">Dashboard</MobileMenuItem>
                <li>
                  <button onClick={handleSignOut} type="button">
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <MobileMenuItem isExact to="/">
                  Home
                </MobileMenuItem>
                <li>
                  <a href="/api/auth/sign-in">Sign In</a>
                </li>
                <li>
                  <a href="/api/auth/sign-up">Sign Up</a>
                </li>
              </>
            )}
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
      activeProps={{ className: "btn-active" }}
      className="btn btn-ghost btn-sm"
      to={to}
    >
      {children}
    </Link>
  );
}

function MobileMenuItem(props: MenuItemProps) {
  const { children, isExact, to } = props;

  return (
    <li>
      <Link
        activeOptions={{ exact: isExact, includeSearch: false }}
        activeProps={{ className: "menu-active" }}
        to={to}
      >
        {children}
      </Link>
    </li>
  );
}
