import { createFileRoute } from "@tanstack/react-router";
import { uniqBy } from "es-toolkit";
import { AboutMe } from "@/routes/-components/about-me";
import { CurrentCompany } from "@/routes/-components/current-company";
import { HeroAvatar } from "@/routes/-components/hero-avatar";
import { LatestPost } from "@/routes/-components/latest-post";
import { NameAnimation } from "@/routes/-components/name-animation";
import { PreviousCompanies } from "@/routes/-components/previous-companies";
import { SocialLinks } from "@/routes/-components/social-links";
import { orpcTanstackQueryClient } from "@/server/client";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        content: "Manthan (@nahtnam) - Principal Software Engineer at Mercury",
        title: "Manthan (@nahtnam) - Principal Software Engineer at Mercury",
      },
      {
        content:
          "Personal website of Manthan (@nahtnam) - Principal Software Engineer at Mercury. Writing about software, startups, personal finance, and product reviews.",
        name: "description",
      },
      {
        content: "Manthan (@nahtnam) - Principal Software Engineer at Mercury",
        property: "og:title",
      },
      {
        content:
          "Personal website of Manthan (@nahtnam) - Principal Software Engineer at Mercury. Writing about software, startups, personal finance, and product reviews.",
        property: "og:description",
      },
    ],
  }),
  loader: async ({ context }) => {
    const [{ experiences }, { posts }] = await Promise.all([
      context.queryClient.fetchQuery(
        orpcTanstackQueryClient.resume.listExperiences.queryOptions()
      ),
      context.queryClient.fetchQuery(
        orpcTanstackQueryClient.blog.listPosts.queryOptions()
      ),
    ]);
    return { experiences, latestPost: posts.at(0) };
  },
});

function RouteComponent() {
  const { experiences, latestPost } = Route.useLoaderData();

  const currentExperience = experiences.at(0);
  const previousCompanies = uniqBy(
    experiences.map((exp) => exp.company),
    (company) => company.id
  ).filter((company) => company.id !== currentExperience?.company.id);

  return (
    <div className="flex h-full flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex flex-col items-center space-y-6">
          <HeroAvatar />

          <h1 className="text-center">
            <NameAnimation />
          </h1>

          {currentExperience ? (
            <CurrentCompany
              companyName={currentExperience.company.name}
              title={currentExperience.title}
            />
          ) : null}

          <AboutMe />

          <SocialLinks />

          <PreviousCompanies companies={previousCompanies} />

          {latestPost ? <LatestPost post={latestPost} /> : null}
        </div>
      </main>
    </div>
  );
}
