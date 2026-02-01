import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/routes/-shadcn/components/ui/badge";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

type CurrentCompanyProps = {
  companyName: string;
  companyUrl: string;
  title: string;
};

export function CurrentCompany({
  companyName,
  companyUrl,
  title,
}: CurrentCompanyProps) {
  return (
    <Badge
      className="h-auto gap-2 px-4 py-2 text-sm"
      render={
        // biome-ignore lint/a11y/useAnchorContent: content provided via Badge children
        <a
          aria-label={`View ${companyName}`}
          href={companyUrl}
          rel="noopener noreferrer"
          target="_blank"
        />
      }
      variant="outline"
    >
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
      </span>
      <Muted>{title.toLowerCase()}</Muted>
      <span className="font-medium">@ {companyName}</span>
      <ArrowUpRight className="size-4 text-muted-foreground" />
    </Badge>
  );
}
