import { Link } from "@tanstack/react-router";
import { Badge } from "@/routes/-shadcn/components/ui/badge";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

type CurrentCompanyProps = {
  companyName: string;
  title: string;
};

export function CurrentCompany({ companyName, title }: CurrentCompanyProps) {
  return (
    <Badge
      className="h-auto gap-2 px-4 py-2 text-sm"
      render={<Link aria-label="View experience" to="/experience" />}
      variant="outline"
    >
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
      </span>
      <Muted>{title.toLowerCase()}</Muted>
      <span className="font-medium">@ {companyName}</span>
    </Badge>
  );
}
