/* oxlint-disable react-doctor/nextjs-no-img-element */
import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQueries } from "convex-route-query";
import { ArrowUpRightIcon } from "lucide-react";

import { createSeo, pageSeo } from "@/lib/seo";

const { listEducation, listExperiences, listProjects } =
  createConvexRouteQueries({
    listEducation: api.resume.queries.listEducation,
    listExperiences: api.resume.queries.listExperiences,
    listProjects: api.resume.queries.listProjects,
  });

export const Route = createFileRoute("/_public/experience/")({
  component: ExperiencePage,
  async loader(context) {
    const [educationRouteData, experienceRouteData, projectRouteData] =
      await Promise.all([
        listEducation.prefetchRoute(context, {}),
        listExperiences.prefetchRoute(context, {}),
        listProjects.prefetchRoute(context, {}),
      ]);

    return {
      ...educationRouteData,
      ...experienceRouteData,
      ...projectRouteData,
    };
  },
  head: () => createSeo(pageSeo.experience),
});

function ExperiencePage() {
  const { data: education } = listEducation.useSuspenseRouteQuery(Route);
  const { data: experiences } = listExperiences.useSuspenseRouteQuery(Route);
  const { data: projects } = listProjects.useSuspenseRouteQuery(Route);

  return (
    <div className="page-shell page-shell-wide print:max-w-none print:p-0">
      <header className="mb-14 border-b border-base-300 pb-10 sm:mb-16 sm:pb-12 print:mb-8 print:pb-5">
        <p className="mb-5 text-sm font-medium text-base-content/70">Career</p>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.55fr)] lg:items-end">
          <h1 className="heading text-5xl sm:text-6xl lg:text-7xl">
            Experience
          </h1>
          <p className="text-pretty text-lg leading-8 text-base-content/75">
            A snapshot of the companies, projects, and education that shaped how
            I build products and teams.
          </p>
        </div>
      </header>

      <div className="space-y-20 lg:space-y-24 print:space-y-10">
        <WorkSection experiences={experiences} />
        <ProjectsSection projects={projects} />
        <EducationSection education={education} />
      </div>
    </div>
  );
}

type Company = {
  readonly _id: string;
  readonly logoUrl: string;
  readonly name: string;
  readonly websiteUrl: string;
};

type Experience = {
  readonly _id: string;
  readonly company: Company;
  readonly description?: string;
  readonly endDate?: number;
  readonly location: string;
  readonly startDate: number;
  readonly title: string;
};

type CompanyGroup = {
  readonly company: Company;
  readonly isCurrent: boolean;
  readonly roles: Experience[];
};

type WorkSectionProps = {
  readonly experiences: readonly Experience[];
};

function WorkSection(props: WorkSectionProps) {
  const { experiences } = props;
  const groups = groupByCompany({ experiences });
  const totalExperience = calculateTotalExperience({ experiences });

  return (
    <section aria-labelledby="work-heading">
      <SectionHeading
        aside={`${totalExperience} · ${experiences.length} roles · recent first`}
        id="work-heading"
        title="Work"
      />

      <ol className="border-b border-base-300">
        {groups.map((group) => (
          <li
            key={group.company._id}
            className="border-t border-base-300 py-8 sm:py-10 print:break-inside-avoid print:py-5"
          >
            <CompanyEntry group={group} />
          </li>
        ))}
      </ol>
    </section>
  );
}

type CompanyEntryProps = {
  readonly group: CompanyGroup;
};

function CompanyEntry(props: CompanyEntryProps) {
  const { group } = props;
  const { company, isCurrent } = group;
  const sortedRoles = group.roles;
  const earliestStart = sortedRoles.at(-1)?.startDate ?? 0;
  const endDates = sortedRoles
    .map((role) => role.endDate)
    .filter((value): value is number => typeof value === "number");
  const startYear = new Date(earliestStart).getFullYear();
  let endLabel: number | string = isCurrent ? "Present" : "—";

  if (!(isCurrent || endDates.length === 0)) {
    endLabel = new Date(Math.max(...endDates)).getFullYear();
  }

  return (
    <article className="grid gap-7 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 print:grid-cols-[9rem_minmax(0,1fr)] print:gap-6">
      <div>
        <a
          aria-label={`Visit ${company.name}`}
          className="group inline-flex min-w-0 items-center gap-4 font-semibold text-base-content underline-offset-4 hover:underline"
          href={company.websiteUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="avatar shrink-0 print:hidden">
            <div className="size-16 overflow-hidden rounded-[0.9rem] border border-base-content/15 bg-base-100 transition-transform duration-200 group-hover:-translate-y-0.5">
              <img
                alt=""
                className="size-full object-cover"
                src={company.logoUrl}
              />
            </div>
          </div>
          <span className="inline-flex min-w-0 items-start gap-1.5 leading-5">
            <span>{company.name}</span>
            <ArrowUpRightIcon className="mt-0.5 size-4 shrink-0 text-base-content/60 print:hidden" />
          </span>
        </a>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-base-content/70">
          <span className="font-mono">
            {startYear} — {endLabel}
          </span>
          <span aria-hidden="true" className="text-base-content/35">
            /
          </span>
          <span>
            {sortedRoles.length} role{sortedRoles.length === 1 ? "" : "s"}
          </span>
          {isCurrent ? (
            <span className="badge badge-success badge-soft">Current</span>
          ) : null}
        </div>
      </div>

      <ul className="divide-y divide-base-300">
        {sortedRoles.map((role) => (
          <li
            key={role._id}
            className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_10rem_5rem] sm:items-start sm:gap-6 print:grid-cols-[minmax(0,1fr)_8rem_4rem] print:gap-4 print:py-3"
          >
            <div>
              <h4 className="text-lg font-semibold leading-7">{role.title}</h4>
              {role.description ? (
                <p className="mt-2 text-base leading-7 text-base-content/75">
                  {role.description}
                </p>
              ) : null}
            </div>
            <div className="text-sm leading-6 text-base-content/70">
              <p className="font-mono">
                {formatDate({ date: role.startDate })} –{" "}
                {role.endDate ? formatDate({ date: role.endDate }) : "Present"}
              </p>
              <p className="mt-1">{role.location}</p>
            </div>
            <p className="font-mono text-sm text-base-content/70 sm:text-right">
              {formatDuration({
                endDate: role.endDate,
                startDate: role.startDate,
              })}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

type Project = {
  readonly _id: string;
  readonly description: string;
  readonly link: string;
  readonly name: string;
  readonly tags: readonly string[];
};

type ProjectsSectionProps = {
  readonly projects: readonly Project[];
};

function ProjectsSection(props: ProjectsSectionProps) {
  const { projects } = props;

  return (
    <section aria-labelledby="projects-heading">
      <SectionHeading id="projects-heading" title="Projects" />
      <ul className="border-b border-base-300">
        {projects.map((project) => (
          <li
            key={project._id}
            className="border-t border-base-300 print:break-inside-avoid"
          >
            <a
              aria-label={`Open project ${project.name}`}
              className="group grid gap-4 py-7 sm:grid-cols-[minmax(10rem,0.75fr)_minmax(0,1.5fr)_minmax(9rem,0.65fr)_1.25rem] sm:items-start sm:gap-7 print:grid-cols-[8rem_minmax(0,1fr)_7rem] print:gap-4 print:py-4"
              href={project.link}
              rel="noopener noreferrer"
              target="_blank"
            >
              <h3 className="heading text-xl group-hover:underline group-hover:underline-offset-4">
                {project.name}
              </h3>
              <p className="text-base leading-7 text-base-content/75">
                {project.description}
              </p>
              <p className="font-mono text-sm leading-6 text-base-content/70 sm:text-right">
                {project.tags.join(" · ")}
              </p>
              <ArrowUpRightIcon className="size-5 text-base-content/60 print:hidden" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Education = {
  readonly _id: string;
  readonly degree: string;
  readonly details?: string;
  readonly endYear: string;
  readonly school: string;
  readonly startYear: string;
};

type EducationSectionProps = {
  readonly education: readonly Education[];
};

function EducationSection(props: EducationSectionProps) {
  const { education } = props;

  return (
    <section aria-labelledby="education-heading">
      <SectionHeading id="education-heading" title="Education" />
      <ul className="border-b border-base-300">
        {education.map((item) => (
          <li
            key={item._id}
            className="grid gap-4 border-t border-base-300 py-7 sm:grid-cols-[minmax(14rem,1.15fr)_minmax(0,1fr)_auto] sm:items-start sm:gap-8 print:break-inside-avoid print:grid-cols-[12rem_minmax(0,1fr)_auto] print:gap-5 print:py-4"
          >
            <h3 className="heading text-xl leading-7">{item.school}</h3>
            <div>
              <p className="text-base leading-7 text-base-content/80">
                {item.degree}
              </p>
              {item.details ? (
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  {item.details}
                </p>
              ) : null}
            </div>
            <p className="font-mono text-sm text-base-content/70 sm:text-right">
              {item.startYear} – {item.endYear}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

type SectionHeadingProps = {
  readonly aside?: string;
  readonly id: string;
  readonly title: string;
};

function SectionHeading(props: SectionHeadingProps) {
  const { aside, id, title } = props;

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <h2 className="heading text-3xl sm:text-4xl" id={id}>
        {title}
      </h2>
      {aside ? (
        <p className="font-mono text-sm text-base-content/70">{aside}</p>
      ) : null}
    </div>
  );
}

type CalculateTotalExperienceOptions = {
  readonly experiences: readonly Experience[];
};

function calculateTotalExperience(options: CalculateTotalExperienceOptions) {
  const { experiences } = options;
  let totalMonths = 0;

  for (const experience of experiences) {
    const end = experience.endDate ? new Date(experience.endDate) : new Date();
    totalMonths += differenceInMonths({
      end,
      start: new Date(experience.startDate),
    });
  }

  return formatMonthCount({ totalMonths });
}

type GroupByCompanyOptions = {
  readonly experiences: readonly Experience[];
};

function groupByCompany(options: GroupByCompanyOptions) {
  const { experiences } = options;
  const groups = new Map<string, CompanyGroup>();

  for (const experience of experiences) {
    const existing = groups.get(experience.company._id);

    if (existing) {
      existing.roles.push(experience);
      continue;
    }

    groups.set(experience.company._id, {
      company: experience.company,
      isCurrent: !experience.endDate,
      roles: [experience],
    });
  }

  return [...groups.values()];
}

type FormatDateOptions = {
  readonly date: number;
};

function formatDate(options: FormatDateOptions) {
  const { date } = options;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

type FormatDurationOptions = {
  readonly endDate: number | undefined;
  readonly startDate: number;
};

function formatDuration(options: FormatDurationOptions) {
  const { endDate, startDate } = options;
  const totalMonths =
    differenceInMonths({
      end: endDate ? new Date(endDate) : new Date(),
      start: new Date(startDate),
    }) + 1;

  return formatMonthCount({ totalMonths });
}

type DifferenceInMonthsOptions = {
  readonly end: Date;
  readonly start: Date;
};

function differenceInMonths(options: DifferenceInMonthsOptions) {
  const { end, start } = options;
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth();

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

type FormatMonthCountOptions = {
  readonly totalMonths: number;
};

function formatMonthCount(options: FormatMonthCountOptions) {
  const { totalMonths } = options;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months}mo`;
  }

  if (months === 0) {
    return `${years}yr`;
  }

  return `${years}yr ${months}mo`;
}
