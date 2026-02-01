import { Button } from "@/routes/-shadcn/components/ui/button";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

type Company = {
  id: string;
  name: string;
  websiteUrl: string;
};

type PreviousCompaniesProps = {
  companies: Company[];
};

export function PreviousCompanies({ companies }: PreviousCompaniesProps) {
  if (companies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2 pt-4">
      <Muted className="text-xs uppercase tracking-wide">Previously at</Muted>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {companies.map((company) => (
          <Button
            className="text-muted-foreground"
            key={company.id}
            render={
              // biome-ignore lint/a11y/useAnchorContent: content provided via Button children
              <a
                aria-label={company.name}
                href={company.websiteUrl}
                rel="noopener noreferrer"
                target="_blank"
              />
            }
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
