/* eslint-disable sort-keys */
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { api } from "convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { H1, Lead } from "@/components/ui/typography";
import { appUrl } from "@/lib/config";
import { EducationSection } from "@/routes/-components/education-section";
import { ExperienceSection } from "@/routes/-components/experience-section";
import { ProjectsSection } from "@/routes/-components/projects-section";

const listEducation = createConvexRouteQuery(api.resume.queries.listEducation);
const listExperiences = createConvexRouteQuery(
  api.resume.queries.listExperiences,
);
const listProjects = createConvexRouteQuery(api.resume.queries.listProjects);

export const Route = createFileRoute("/experience/")({
  component: ExperiencePage,
  async loader({ context }) {
    await Promise.all([
      listEducation.prefetchQuery(context.queryClient),
      listExperiences.prefetchQuery(context.queryClient),
      listProjects.prefetchQuery(context.queryClient),
    ]);
  },
  head: () => ({
    links: [
      {
        href: `${appUrl}/experience`,
        rel: "canonical",
      },
    ],
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
        content: `${appUrl}/experience`,
        property: "og:url",
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
  const { data: education } = listEducation.useSuspenseQuery();
  const { data: experiences } = listExperiences.useSuspenseQuery();
  const { data: projects } = listProjects.useSuspenseQuery();

  return (
    <div className="page-shell page-shell-wide print:max-w-none print:p-0 print:px-4">
      <div className="page-intro mb-8 print:mb-4">
        <span className="eyebrow mb-4">Career</span>
        <H1 className="print:text-2xl">Experience</H1>
        <Lead className="mt-4 max-w-2xl text-base">
          A snapshot of the companies, projects, and education that shaped how I
          build products and teams.
        </Lead>
      </div>

      <div className="space-y-8 print:space-y-4">
        <div className="section-card print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <ExperienceSection experiences={experiences} />
        </div>

        <Separator className="print:hidden" />

        <div className="section-card print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <ProjectsSection projects={projects} />
        </div>

        <Separator className="print:hidden" />

        <div className="section-card print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <EducationSection education={education} />
        </div>
      </div>
    </div>
  );
}
