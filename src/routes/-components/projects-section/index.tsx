import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { H2, Muted, Small } from "@/components/ui/typography";

type Project = {
  _id: string;
  description: string;
  link: string;
  name: string;
  tags: string[];
};

type ProjectsSectionProps = {
  readonly projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-2 print:mb-2">
        <Folder className="size-5" />
        <H2 className="border-0 py-0 text-2xl">Projects</H2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
        {projects.map((project) => (
          <a
            key={project._id}
            className="flex flex-col rounded-[2rem] border border-border/75 bg-background/72 p-4 shadow-[0_20px_50px_-42px_color-mix(in_srgb,var(--color-foreground)_36%,transparent)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_56px_-40px_color-mix(in_srgb,var(--color-primary)_28%,transparent)] print:border-0 print:p-0 print:shadow-none"
            href={project.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="mb-1 flex items-center justify-between">
              <Small className="font-medium text-foreground">
                {project.name}
              </Small>
            </div>
            <Muted className="mb-2 text-sm leading-relaxed print:mb-1">
              {project.description}
            </Muted>
            <div className="mt-auto flex flex-wrap gap-1 pt-2">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-secondary/80 text-foreground text-[0.68rem]"
                  variant="secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
