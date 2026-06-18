import { Link } from "@tanstack/react-router";
import { Muted } from "@/components/ui/typography";

type CurrentCompanyProps = {
  readonly companyName: string;
  readonly title: string;
};

export function CurrentCompany({ companyName, title }: CurrentCompanyProps) {
  return (
    <Link
      aria-label="View experience"
      className="inline-flex max-w-full items-center gap-2.5 rounded-md border border-border bg-card px-3.5 py-2 text-sm whitespace-nowrap transition-colors hover:border-primary/40 hover:bg-accent/50"
      to="/experience"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
      </span>
      <Muted className="font-mono text-[0.66rem] tracking-[0.12em] uppercase">
        {title}
      </Muted>
      <span className="font-medium">@ {companyName}</span>
    </Link>
  );
}
