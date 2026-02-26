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
    <div className="flex flex-col items-center space-y-2 pt-4">
      <Muted className="text-xs">Previously at</Muted>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {companies.map((company) => (
          <Button
            key={company._id}
            asChild
            className="text-muted-foreground"
            size="sm"
            variant="link"
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
