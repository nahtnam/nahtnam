import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/routes/-shadcn/components/ui/button";

const SOCIAL_LINKS = [
  { icon: Github, name: "GitHub", url: "https://github.com/nahtnam" },
  { icon: Linkedin, name: "LinkedIn", url: "https://linkedin.com/in/nahtnam" },
  { icon: Twitter, name: "Twitter", url: "https://twitter.com/nahtnam" },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      {SOCIAL_LINKS.map((social) => (
        <Button
          key={social.name}
          render={
            // biome-ignore lint/a11y/useAnchorContent: content provided via Button children
            <a
              aria-label={social.name}
              href={social.url}
              rel="noopener noreferrer"
              target="_blank"
            />
          }
          size="icon-lg"
          variant="outline"
        >
          <social.icon className="size-5" />
        </Button>
      ))}
      <Button render={<Link to="/contact" />} size="lg">
        Get in Touch
        <ArrowUpRight className="size-4" />
      </Button>
    </div>
  );
}
