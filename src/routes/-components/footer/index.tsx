import { Link } from "@tanstack/react-router";
import { Icon as IconifyIcon } from "@iconify-icon/react";
import { appName } from "@/lib/config";

const footerLinks = [
  { label: "Experience", to: "/experience" },
  { label: "Blog", to: "/blog" },
  { label: "Travel", to: "/travel" },
  { label: "Contact", to: "/contact" },
];

const socials = [
  { icon: "mdi:github", name: "GitHub", url: "https://github.com/nahtnam" },
  {
    icon: "mdi:linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/nahtnam",
  },
  { icon: "mdi:twitter", name: "Twitter", url: "https://twitter.com/nahtnam" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container mx-auto flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-3">
          <span className="font-serif text-2xl tracking-[-0.02em]">
            {appName}
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            Software engineer, indie hacker, and occasional writer building
            things that matter.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <p className="mb-3 font-mono text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Pages
            </p>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-mono text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Elsewhere
            </p>
            <ul className="space-y-2">
              {socials.map((social) => (
                <li key={social.name}>
                  <a
                    className="inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary"
                    href={social.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <IconifyIcon icon={social.icon} height={14} width={14} />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto py-5">
          <p className="font-mono text-[0.68rem] tracking-[0.22em] text-muted-foreground uppercase">
            &copy; {year} {appName}
          </p>
        </div>
      </div>
    </footer>
  );
}
