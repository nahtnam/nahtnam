import { ArrowUpRight } from "lucide-react";

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
    <section className="print:break-inside-avoid">
      <div className="mb-8 flex items-baseline gap-4 print:mb-4">
        <span className="font-mono text-[0.7rem] font-semibold tracking-[0.2em] text-primary">
          02
        </span>
        <h2 className="font-serif text-3xl tracking-[-0.02em]">Projects</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
        {projects.map((project) => (
          <a
            key={project._id}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 print:border print:p-3"
            href={project.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold tracking-tight">{project.name}</h3>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[0.64rem] tracking-wide text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
