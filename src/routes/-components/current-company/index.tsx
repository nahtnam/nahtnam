import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/ui/typography";

type CurrentCompanyProps = {
  readonly companyName: string;
  readonly title: string;
};

export function CurrentCompany({ companyName, title }: CurrentCompanyProps) {
  return (
    <Badge asChild className="h-auto gap-2 px-4 py-2 text-sm" variant="outline">
      <Link aria-label="View experience" to="/experience">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
        </span>
        <Muted>{title}</Muted>
        <span className="font-medium">@ {companyName}</span>
      </Link>
    </Badge>
  );
}
