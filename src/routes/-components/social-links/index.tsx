import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Icon as IconifyIcon } from "@iconify-icon/react";
import { Button } from "@/components/ui/button";

const SOCIAL_LINKS = [
  { icon: "mdi:github", name: "GitHub", url: "https://github.com/nahtnam" },
  {
    icon: "mdi:linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/nahtnam",
  },
  { icon: "mdi:twitter", name: "Twitter", url: "https://twitter.com/nahtnam" },
];

export function SocialLinks() {
  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {SOCIAL_LINKS.map((social) => (
          <Button
            key={social.name}
            asChild
            className="bg-background/75"
            size="icon-lg"
            variant="outline"
          >
            <a
              aria-label={social.name}
              href={social.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconifyIcon icon={social.icon} height={20} width={20} />
            </a>
          </Button>
        ))}
      </div>
      <Button asChild className="w-full px-5 sm:w-auto" size="lg">
        <Link to="/contact">
          Get in Touch
          <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
