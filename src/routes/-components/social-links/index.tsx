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
    <div className="flex items-center gap-2">
      {SOCIAL_LINKS.map((social) => (
        <Button key={social.name} asChild size="icon" variant="outline">
          <a
            aria-label={social.name}
            href={social.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <IconifyIcon icon={social.icon} height={18} width={18} />
          </a>
        </Button>
      ))}
      <Button asChild className="gap-1.5" size="default">
        <Link to="/contact">
          Get in Touch
          <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
