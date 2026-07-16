import { appName } from "@repo/config/app";
import { Link } from "@tanstack/react-router";

import { AnimatedIdentity } from "../animated-identity";

const pageLinks = [
  { label: "Experience", to: "/experience" as const },
  { label: "Blog", to: "/blog" as const },
  { label: "Travel", to: "/travel" as const },
  { label: "Contact", to: "/contact" as const },
];

const socialLinks = [
  { label: "GitHub", url: "https://github.com/nahtnam" },
  { label: "LinkedIn", url: "https://linkedin.com/in/nahtnam" },
  { label: "Twitter", url: "https://twitter.com/nahtnam" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-base-300 bg-base-200/55">
      <div className="footer container gap-6 py-8 sm:footer-horizontal sm:items-center">
        <aside className="max-w-md">
          <p className="text-base font-semibold tracking-[-0.02em] text-primary">
            <span className="sr-only">Manthan, also known as @nahtnam</span>
            <AnimatedIdentity
              className="block min-w-[8ch]"
              initialIdentity="@nahtnam"
            />
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-base-content/60">
            Software engineer, indie hacker, and occasional writer building
            things that matter.
          </p>
          <p className="mt-3 font-mono text-[0.7rem] tracking-[0.12em] text-base-content/55 uppercase">
            &copy; {year} {appName}
          </p>
        </aside>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:ml-auto sm:justify-end"
        >
          {pageLinks.map((link) => (
            <Link
              key={link.to}
              className="inline-flex min-h-11 items-center text-sm font-medium text-base-content/65 transition-colors hover:text-base-content"
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-base-300 sm:block"
          />
          {socialLinks.map((link) => (
            <a
              key={link.label}
              className="inline-flex min-h-11 items-center text-sm text-base-content/55 transition-colors hover:text-base-content"
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
