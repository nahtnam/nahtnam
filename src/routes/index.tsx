/* eslint-disable sort-keys */
import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { uniqBy } from "es-toolkit";
import { appUrl } from "@/lib/config";
import { AboutMe } from "@/routes/-components/about-me";
import { CurrentCompany } from "@/routes/-components/current-company";
import { HeroAvatar } from "@/routes/-components/hero-avatar";
import { LatestPost } from "@/routes/-components/latest-post";
import { NameAnimation } from "@/routes/-components/name-animation";
import { PreviousCompanies } from "@/routes/-components/previous-companies";
import { SocialLinks } from "@/routes/-components/social-links";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  async loader({ context }) {
    const [experiences, posts] = await Promise.all([
      context.queryClient.fetchQuery(
        convexQuery(api.resume.queries.listExperiences, {}),
      ),
      context.queryClient.fetchQuery(
        convexQuery(api.blog.queries.listPosts, {}),
      ),
    ]);
    return { experiences, latestPost: posts.at(0) };
  },
  head: () => ({
    links: [
      {
        href: appUrl,
        rel: "canonical",
      },
    ],
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
        content: appUrl,
        property: "og:url",
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
});

function RouteComponent() {
  const { experiences, latestPost } = Route.useLoaderData();

  const currentExperience = experiences.at(0);
  const previousCompanies = uniqBy(
    experiences.map((exp) => exp.company),
    (company) => company._id,
  ).filter((company) => company._id !== currentExperience?.company._id);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Manthan",
    alternateName: "nahtnam",
    url: appUrl,
    image: `${appUrl}/assets/images/me.avif`,
    jobTitle: currentExperience?.title,
    worksFor: currentExperience
      ? {
          "@type": "Organization",
          name: currentExperience.company.name,
        }
      : undefined,
    sameAs: ["https://github.com/nahtnam", "https://twitter.com/nahtnam"],
  };

  return (
    <div className="flex h-full flex-col">
      {/* eslint-disable react/no-danger */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        type="application/ld+json"
      />
      {/* eslint-enable react/no-danger */}
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
