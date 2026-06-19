/* eslint-disable sort-keys */
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
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

const listExperiences = createConvexRouteQuery(
  api.resume.queries.listExperiences,
);
const listPosts = createConvexRouteQuery(api.blog.queries.listPosts);

export const Route = createFileRoute("/")({
  component: RouteComponent,
  async loader({ context }) {
    await Promise.all([
      listExperiences.prefetchQuery(context.queryClient),
      listPosts.prefetchQuery(context.queryClient),
    ]);
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
  const { data: experiences } = listExperiences.useSuspenseQuery();
  const { data: posts } = listPosts.useSuspenseQuery();
  const latestPost = posts.at(0);

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
      <main className="page-shell page-shell-wide flex flex-1 flex-col items-center !py-20 md:!py-28">
        <div className="flex w-full flex-col items-center gap-7 text-center">
          <HeroAvatar />

          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
              Hey there, I&apos;m
            </p>
            <h1>
              <NameAnimation />
            </h1>
          </div>

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
