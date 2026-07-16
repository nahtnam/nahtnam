/* oxlint-disable react-doctor/nextjs-no-img-element, react/no-danger */
import { api } from "@repo/backend/api";
import { appUrl } from "@repo/config/app";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQueries } from "convex-route-query";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { createSeo, pageSeo, siteDescription, siteImage } from "@/lib/seo";
import { AnimatedIdentity } from "@/routes/-components/animated-identity";

const { listExperiences, listPosts } = createConvexRouteQueries({
  listExperiences: api.resume.queries.listExperiences,
  listPosts: api.blog.queries.listPosts,
});

const socialLinks = [
  { label: "GitHub", url: "https://github.com/nahtnam" },
  { label: "LinkedIn", url: "https://linkedin.com/in/nahtnam" },
  { label: "Twitter", url: "https://twitter.com/nahtnam" },
];
export const Route = createFileRoute("/_public/")({
  component: HomePage,
  async loader(context) {
    const [experienceRouteData, postRouteData] = await Promise.all([
      listExperiences.prefetchRoute(context, {}),
      listPosts.prefetchRoute(context, {}),
    ]);

    return {
      ...experienceRouteData,
      ...postRouteData,
    };
  },
  head: () => createSeo(pageSeo.home),
});

function HomePage() {
  const { data: experiences } = listExperiences.useSuspenseRouteQuery(Route);
  const { data: posts } = listPosts.useSuspenseRouteQuery(Route);
  const currentExperience = experiences.at(0);
  const previousCompanies = getPreviousCompanies({
    currentCompanyId: currentExperience?.company._id,
    experiences,
  });
  const latestPost = posts.at(0);
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    alternateName: "nahtnam",
    description: siteDescription,
    image: siteImage,
    jobTitle: currentExperience?.title,
    name: "Manthan",
    sameAs: [
      "https://github.com/nahtnam",
      "https://linkedin.com/in/nahtnam",
      "https://twitter.com/nahtnam",
    ],
    url: appUrl,
    worksFor: currentExperience
      ? {
          "@type": "Organization",
          name: currentExperience.company.name,
        }
      : undefined,
  };

  return (
    <div className="container page-shell-wide pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-24">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        type="application/ld+json"
      />

      <section className="grid gap-10 pb-12 sm:pb-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:gap-20 lg:pb-20">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="avatar">
              <div className="size-16 rounded-[1.15rem] border border-base-300 bg-base-100 p-1 shadow-sm sm:size-[4.5rem]">
                <img
                  alt="Manthan"
                  className="rounded-[0.8rem] bg-base-200"
                  src="/assets/images/me.avif"
                />
              </div>
            </div>
            <p className="route-kicker">Hey there, I&apos;m</p>
          </div>

          <IdentityLockup />
        </div>

        <div className="border-t-2 border-base-content pt-6 lg:border-t-0 lg:border-l lg:border-base-300 lg:pt-0 lg:pl-10">
          {currentExperience ? (
            <div>
              <p className="route-kicker">Currently</p>
              <Link
                className="group mt-3 flex items-start justify-between gap-5 py-2"
                to="/experience"
              >
                <span>
                  <span className="block text-lg font-semibold leading-6">
                    {currentExperience.title}
                  </span>
                  <span className="mt-1 block text-base-content/60">
                    @ {currentExperience.company.name}
                  </span>
                </span>
                <ArrowRightIcon className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : null}

          <p className="mt-6 text-pretty text-xl leading-8 text-base-content/75">
            Software Engineer with experience at high-growth startups. Building
            things that matter.
          </p>

          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-base-content/60">
            <span>🚀 indie hacker</span>
            <span aria-hidden="true" className="text-base-content/25">
              /
            </span>
            <span>🏸 badminton player</span>
          </p>

          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="previously-at-heading"
        className="grid gap-5 border-y border-base-300 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center"
      >
        <h2 className="route-kicker" id="previously-at-heading">
          Previously at
        </h2>
        <div className="flex flex-wrap gap-x-7 gap-y-3">
          {previousCompanies.map((company) => (
            <Link
              key={company._id}
              className="text-base font-medium text-base-content/55 transition-colors hover:text-base-content"
              to="/experience"
            >
              {company.name}
            </Link>
          ))}
        </div>
      </section>

      {latestPost ? (
        <section
          aria-labelledby="latest-writing-heading"
          className="grid gap-6 py-12 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-start sm:py-14"
        >
          <h2 className="route-kicker pt-1" id="latest-writing-heading">
            Latest writing
          </h2>
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-base-content/60">
              {latestPost.category.name}
            </p>
            <Link
              className="group mt-2 block"
              params={{ slug: latestPost.slug }}
              to="/blog/$slug"
            >
              <h3 className="heading text-3xl transition-colors group-hover:text-primary sm:text-4xl">
                {latestPost.title}
              </h3>
              <p className="muted mt-3 leading-7">{latestPost.excerpt}</p>
            </Link>
          </div>
          <Link
            className="link link-hover inline-flex min-h-11 items-center gap-2 text-sm font-semibold sm:justify-self-end"
            params={{ slug: latestPost.slug }}
            to="/blog/$slug"
          >
            Read post
            <ArrowRightIcon className="size-4" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}

function IdentityLockup() {
  return (
    <h1
      aria-label="Manthan, also known as @nahtnam"
      className="heading mt-5 min-h-[1.3em] whitespace-nowrap text-[clamp(3.7rem,9.2vw,8rem)] leading-[1.05]"
    >
      <AnimatedIdentity className="block" initialIdentity="manthan" />
    </h1>
  );
}

function SocialLinks() {
  return (
    <div className="flex flex-col items-start gap-2">
      <Link className="btn btn-primary" to="/contact">
        Get in Touch
        <ArrowUpRightIcon className="size-4" />
      </Link>
      <div className="flex flex-wrap items-center gap-x-5">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            className="link link-hover inline-flex min-h-11 items-center text-sm font-medium"
            href={social.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {social.label}
          </a>
        ))}
      </div>
    </div>
  );
}

type Company = {
  readonly _id: string;
  readonly name: string;
};

type ExperienceWithCompany = {
  readonly company: Company;
};

type GetPreviousCompaniesOptions = {
  readonly currentCompanyId: string | undefined;
  readonly experiences: readonly ExperienceWithCompany[];
};

function getPreviousCompanies(options: GetPreviousCompaniesOptions) {
  const { currentCompanyId, experiences } = options;
  const companies = new Map<string, Company>();

  for (const experience of experiences) {
    const companyId = experience.company._id;
    if (companyId !== currentCompanyId && !companies.has(companyId)) {
      companies.set(companyId, experience.company);
    }
  }

  return [...companies.values()];
}
