'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { navigationItems } from "../data/navigation";
import { socialSites } from "../data/social";

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  return (
    <footer className="footer footer-center p-10">
      <div className="grid grid-flow-col gap-4">
        {navigationItems.map(({ href, label, isExternal }) => (
          <a key={href} href={href} {...(isExternal ? { target: "_blank", rel: "noreferrer"} : {}) } className={classNames("link link-hover", pathname === href && 'underline')}>{label}</a>
        ))}
      </div>
      <div>
        <div className="grid grid-flow-col gap-8">
          {socialSites.map(({ href, fontAwesomeIcon }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={fontAwesomeIcon} size="2xl" /></a>
          ))}
        </div>
      </div>
      <div>
        <p>&copy; {year} nahtnam. All rights reserved.</p>
      </div>
    </footer>
  )
}
