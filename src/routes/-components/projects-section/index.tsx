import { Folder } from "lucide-react";
import { Badge } from "@/routes/-shadcn/components/ui/badge";
import { H2, Muted, Small } from "@/routes/-shadcn/components/ui/typography";

interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  tags: string[];
}

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 print:mb-2">
        <Folder className="size-5" />
        <H2 className="border-0 py-0 font-medium text-lg">Projects</H2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
        {projects.map((project) => (
          <a
            className="flex flex-col rounded-lg border p-3 transition-colors hover:border-foreground/20 print:border-0 print:p-0"
            href={project.link}
            key={project.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="mb-1 flex items-center justify-between">
              <Small className="font-medium">{project.name}</Small>
            </div>
            <Muted className="mb-2 text-sm leading-relaxed print:mb-1">
              {project.description}
            </Muted>
            <div className="mt-auto flex flex-wrap gap-1 pt-2">
              {project.tags.map((tag) => (
                <Badge
                  className="bg-muted text-foreground text-xs"
                  key={tag}
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
