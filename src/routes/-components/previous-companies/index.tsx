import { Link } from "@tanstack/react-router";
import { Muted } from "@/components/ui/typography";

type Company = {
  _id: string;
  name: string;
};

type PreviousCompaniesProps = {
  readonly companies: Company[];
};

export function PreviousCompanies({ companies }: PreviousCompaniesProps) {
  if (companies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Muted className="font-mono text-[0.66rem] tracking-[0.22em] uppercase">
        Previously at
      </Muted>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {companies.map((company) => (
          <Link
            key={company._id}
            aria-label={company.name}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            to="/experience"
          >
            {company.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
