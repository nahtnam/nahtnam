"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarClient() {
  const pathname = usePathname();

  const menu = (
    <>
      <li>
        <Link className={pathname === "/" ? "menu-active" : ""} href="/">
          Home
        </Link>
      </li>
      <li>
        <Link
          className={pathname === "/blog" ? "menu-active" : ""}
          href="/blog"
        >
          Blog
        </Link>
      </li>
    </>
  );

  return (
    <div className="navbar p-0">
      <div className="navbar-start gap-4">
        <Link className="font-bold text-xl" href="/">
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
