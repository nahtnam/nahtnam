"use client";

import { faRss, faHome, faBars } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Navbar() {
  const pathname = usePathname();

  const menu = (
    <>
      <li>
        <Link href="/" className={twMerge(pathname === "/" && "menu-active")}>
          <FontAwesomeIcon icon={faHome} />
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/blog"
          className={twMerge(pathname.startsWith("/blog") && "menu-active")}
        >
          <FontAwesomeIcon icon={faRss} />
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
                  <FontAwesomeIcon icon={faBars} />
                </summary>
                <ul className="menu dropdown-content rounded-box bg-base-100 text-base-content z-[1] mt-1 w-max min-w-52 space-y-1 border p-2">
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
