import { createFileRoute } from "@tanstack/react-router";
import { EducationSection } from "@/routes/-components/education-section";
import { ExperienceSection } from "@/routes/-components/experience-section";
import { ProjectsSection } from "@/routes/-components/projects-section";
import { Separator } from "@/routes/-shadcn/components/ui/separator";
import { H1 } from "@/routes/-shadcn/components/ui/typography";
import { orpcTanstackQueryClient } from "@/server/client";

const education = [
  {
    degree: "Bachelor of Science, Computer Science",
    details: "Magna Cum Laude, GPA: 3.9",
    endYear: "Mar 2020",
    school: "University of California, Santa Cruz",
    startYear: "Sep 2017",
  },
];

export const Route = createFileRoute("/experience/")({
  component: ExperiencePage,
  head: () => ({
    meta: [
      {
        content: "Experience | Manthan (@nahtnam)",
        title: "Experience | Manthan (@nahtnam)",
      },
      {
        content:
          "Professional experience, projects, and education history of Manthan (@nahtnam) - Principal Software Engineer at Mercury.",
        name: "description",
      },
      {
        content: "Experience | Manthan (@nahtnam)",
        property: "og:title",
      },
      {
        content:
          "Professional experience, projects, and education history of Manthan (@nahtnam) - Principal Software Engineer at Mercury.",
        property: "og:description",
      },
    ],
  }),
  loader: async ({ context }) => {
    const [{ experiences }, { projects }] = await Promise.all([
      context.queryClient.fetchQuery(
        orpcTanstackQueryClient.resume.listExperiences.queryOptions()
      ),
      context.queryClient.fetchQuery(
        orpcTanstackQueryClient.resume.listProjects.queryOptions()
      ),
    ]);
    return { experiences, projects };
  },
});

function ExperiencePage() {
  const { experiences, projects } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16 print:max-w-none print:p-0 print:px-4">
      <div className="mb-8 print:mb-4">
        <H1 className="font-semibold text-3xl print:text-2xl">Experience</H1>
      </div>

      <div className="space-y-8 print:space-y-4">
        <ExperienceSection experiences={experiences} />

        <Separator className="print:hidden" />

        <ProjectsSection projects={projects} />

        <Separator className="print:hidden" />

        <EducationSection education={education} />
      </div>
    </div>
  );
}
