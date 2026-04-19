import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col items-center space-y-3 pt-4">
      <Muted className="font-mono text-[0.68rem] tracking-[0.24em] uppercase">
        Previously at
      </Muted>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {companies.map((company) => (
          <Button
            key={company._id}
            asChild
            className="border-border/65 bg-background/70 text-muted-foreground hover:text-foreground"
            size="sm"
            variant="outline"
          >
            <Link aria-label={company.name} to="/experience">
              {company.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
