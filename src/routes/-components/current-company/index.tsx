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
      className="h-auto w-fit max-w-full border-primary/18 bg-primary/7 px-4 py-2 text-[0.68rem] text-foreground tracking-[0.1em] sm:px-5 sm:text-[0.72rem] sm:tracking-[0.12em]"
      variant="outline"
    >
      <Link
        aria-label="View experience"
        className="flex w-full max-w-full items-center justify-center gap-2 whitespace-nowrap text-center"
        to="/experience"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
        </span>
        <Muted className="font-mono text-[0.64rem] tracking-[0.1em] uppercase sm:text-[0.68rem] sm:tracking-[0.12em]">
          {title}
        </Muted>
        <span className="shrink-0 font-medium tracking-normal normal-case">
          @ {companyName}
        </span>
      </Link>
    </Badge>
  );
}
