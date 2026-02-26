/* eslint-disable sort-keys */
import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { EducationSection } from "@/routes/-components/education-section";
import { ExperienceSection } from "@/routes/-components/experience-section";
import { ProjectsSection } from "@/routes/-components/projects-section";
import { Separator } from "@/components/ui/separator";
import { H1 } from "@/components/ui/typography";

export const Route = createFileRoute("/experience/")({
  component: ExperiencePage,
  async loader({ context }) {
    const [education, experiences, projects] = await Promise.all([
      context.queryClient.fetchQuery(
        convexQuery(api.resume.queries.listEducation, {}),
      ),
      context.queryClient.fetchQuery(
        convexQuery(api.resume.queries.listExperiences, {}),
      ),
      context.queryClient.fetchQuery(
        convexQuery(api.resume.queries.listProjects, {}),
      ),
    ]);
    return { education, experiences, projects };
  },
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
});

function ExperiencePage() {
  const { education, experiences, projects } = Route.useLoaderData();

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
