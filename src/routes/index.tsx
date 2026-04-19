/* eslint-disable sort-keys */
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { uniqBy } from "es-toolkit";
import { appUrl } from "@/lib/config";
import { cn } from "@/lib/shadcn/utils";
import { AboutMe } from "@/routes/-components/about-me";
import { CurrentCompany } from "@/routes/-components/current-company";
import { HeroAvatar } from "@/routes/-components/hero-avatar";
import { LatestPost } from "@/routes/-components/latest-post";
import { NameAnimation } from "@/routes/-components/name-animation";
import { PreviousCompanies } from "@/routes/-components/previous-companies";
import { SocialLinks } from "@/routes/-components/social-links";

export const Route = createFileRoute("/")({
  component: RouteComponent,
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
  const { data: experiences } = useSuspenseQuery(
    convexQuery(api.resume.queries.listExperiences, {}),
  );
  const { data: posts } = useSuspenseQuery(
    convexQuery(api.blog.queries.listPosts, {}),
  );
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
      <main className="page-shell page-shell-wide flex flex-1 items-center">
        <div className="page-intro mx-auto w-full">
          <div className="flex flex-col items-center gap-10">
            <div className="flex w-full max-w-4xl flex-col items-center gap-7 pt-18 text-center md:pt-22">
              <HeroAvatar />

              <h1 className="text-center">
                <NameAnimation />
              </h1>

              <AboutMe />

              <SocialLinks />
            </div>

            <div className="flex w-full flex-col items-center gap-6 text-center">
              <div
                className={cn(
                  "w-full gap-6",
                  latestPost
                    ? "grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]"
                    : "flex justify-center lg:justify-center",
                )}
              >
                <div className="flex flex-col items-center gap-4">
                  {currentExperience ? (
                    <CurrentCompany
                      companyName={currentExperience.company.name}
                      title={currentExperience.title}
                    />
                  ) : null}
                  <PreviousCompanies companies={previousCompanies} />
                </div>
                {latestPost ? <LatestPost post={latestPost} /> : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
