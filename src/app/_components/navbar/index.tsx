"use client";

import { HomeIcon, MenuIcon, RssIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function Navbar() {
  const pathname = usePathname();

  const menu = (
    <>
      <li>
        <Link href="/" className={twMerge(pathname === "/" && "active")}>
          <HomeIcon className="h-4 w-4" />
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/blog"
          className={twMerge(pathname.startsWith("/blog") && "active")}
        >
          <RssIcon className="h-4 w-4" />
          Blog
        </Link>
      </li>
    </>
  );

  return (
    <div className="border-b">
      <div className="container mx-auto">
        <div className="navbar px-0">
          <div className="navbar-start">
            <Link href="/" className="text-2xl font-bold">
              nahtnam
            </Link>
          </div>
          <div className="navbar-end">
            <div className="hidden md:flex">
              <ul className="menu menu-horizontal space-x-2">{menu}</ul>
            </div>
            <div className="dropdown dropdown-end">
              <details className="dropdown">
                <summary className="btn btn-ghost md:hidden">
                  <MenuIcon />
                </summary>
                <ul className="menu dropdown-content z-[1] mt-1 w-max min-w-52 space-y-1 rounded-box border bg-base-100 p-2 text-base-content">
                  {menu}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
