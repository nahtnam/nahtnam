import { Link } from "@tanstack/react-router";
import { Button } from "@/routes/-shadcn/components/ui/button";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

interface Company {
  id: string;
  name: string;
}

interface PreviousCompaniesProps {
  companies: Company[];
}

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
            className="text-muted-foreground"
            key={company.id}
            render={<Link aria-label={company.name} to="/experience" />}
            size="sm"
            variant="link"
          >
            {company.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
