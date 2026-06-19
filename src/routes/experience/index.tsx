/* eslint-disable sort-keys */
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { api } from "convex/_generated/api";
import { H1, Lead } from "@/components/ui/typography";
import { EducationSection } from "@/routes/-components/education-section";
import { ExperienceSection } from "@/routes/-components/experience-section";
import { ProjectsSection } from "@/routes/-components/projects-section";
import { createSeo, pageSeo } from "@/lib/seo";

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
  head: () => createSeo(pageSeo.experience),
});

function ExperiencePage() {
  const { data: education } = listEducation.useSuspenseQuery();
  const { data: experiences } = listExperiences.useSuspenseQuery();
  const { data: projects } = listProjects.useSuspenseQuery();

  return (
    <div className="page-shell page-shell-wide print:max-w-none print:p-0 print:px-4">
      <div className="page-intro print:mb-4">
        <span className="eyebrow mb-4">Career</span>
        <H1 className="print:text-2xl">Experience</H1>
        <Lead className="mt-4 max-w-2xl text-base">
          A snapshot of the companies, projects, and education that shaped how I
          build products and teams.
        </Lead>
      </div>

      <div className="space-y-16 print:space-y-6">
        <ExperienceSection experiences={experiences} />
        <ProjectsSection projects={projects} />
        <EducationSection education={education} />
      </div>
    </div>
  );
}
