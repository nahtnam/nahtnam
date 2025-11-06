"use client";

import type { User } from "better-auth";
import { ArrowRightIcon, MenuIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "./actions";

type NavbarClientProps = {
  user: User | undefined;
};

export function NavbarClient(props: NavbarClientProps) {
  const { user } = props;
  const pathname = usePathname();

  const menu = user ? (
    <>
      <li>
        <Link className={pathname === "/app" ? "menu-active" : ""} href="/app">
          Dashboard
        </Link>
      </li>

      <li>
        <details>
          <summary>
            <UserIcon className="size-5" />
          </summary>
          <ul className="w-max md:top-5 md:right-0">
            <li className="pointer-events-none">
              <div className="flex flex-col items-start gap-0">
                <div className="font-bold">{user.name}</div>
                <div className="text-xs">{user.email}</div>
              </div>
            </li>
            <li>
              <form action={signOutAction} className="block">
                <button
                  className="w-full cursor-pointer text-left"
                  type="submit"
                >
                  Sign Out
                </button>
              </form>
            </li>
          </ul>
        </details>
      </li>
    </>
  ) : (
    <>
      <li>
        <Link className={pathname === "/" ? "menu-active" : ""} href="/">
          Home
        </Link>
      </li>
      <li>
        <Link
          className={pathname === "/get-started" ? "menu-active" : ""}
          href="/get-started"
        >
          Get Started
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </li>
    </>
  );

  return (
    <div className="navbar p-0">
      <div className="navbar-start gap-4">
        <Link className="font-bold text-xl" href={user ? "/app" : "/"}>
          TODO
        </Link>
      </div>

      <div className="navbar-end">
        <div className="hidden md:flex">
          <ul className="menu menu-horizontal space-x-2">{menu}</ul>
        </div>
        <div className="dropdown dropdown-end">
          {/** biome-ignore lint/a11y/useSemanticElements: daisyui */}
          <div className="btn btn-ghost md:hidden" role="button" tabIndex={0}>
            <MenuIcon className="size-5" />
          </div>
          <ul className="menu dropdown-content z-1 mt-1 w-max min-w-52 gap-1 rounded-box border border-base-300 bg-base-100 text-base-content">
            {menu}
          </ul>
        </div>
      </div>
    </div>
  );
}
