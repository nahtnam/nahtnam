import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/ui/typography";

type CurrentCompanyProps = {
  readonly companyName: string;
  readonly title: string;
};

export function CurrentCompany({ companyName, title }: CurrentCompanyProps) {
  return (
    <Badge
      asChild
      className="h-auto w-auto max-w-full border-primary/18 bg-primary/7 px-3.5 py-2 text-[0.66rem] text-foreground tracking-[0.08em] sm:px-4.5 sm:text-[0.7rem] sm:tracking-[0.1em]"
      variant="outline"
    >
      <Link
        aria-label="View experience"
        className="inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap text-center"
        to="/experience"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
        </span>
        <Muted className="font-mono text-[0.62rem] tracking-[0.08em] uppercase sm:text-[0.66rem] sm:tracking-[0.1em]">
          {title}
        </Muted>
        <span className="shrink-0 font-medium tracking-normal normal-case">
          @ {companyName}
        </span>
      </Link>
    </Badge>
  );
}
