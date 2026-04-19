import { differenceInMonths } from "date-fns";
import { Briefcase } from "lucide-react";
import { formatDate, formatDuration } from "@/routes/-components/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { H2, H3, Muted, P, Small } from "@/components/ui/typography";

type Experience = {
  _id: string;
  company: {
    logoUrl: string;
    name: string;
    websiteUrl: string;
  };
  description?: string;
  endDate?: number;
  location: string;
  startDate: number;
  title: string;
};

type ExperienceSectionProps = {
  readonly experiences: Experience[];
};

function calculateTotalExperience(experiences: Experience[]) {
  let totalMonths = 0;

  for (const exp of experiences) {
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = differenceInMonths(end, new Date(exp.startDate));
    totalMonths += months;
  }

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

function JobCard({
  exp,
  number,
  isCurrent,
}: {
  readonly exp: Experience;
  readonly number: number;
  readonly isCurrent: boolean;
}) {
  return (
    <a
      className={`flex flex-col rounded-[2rem] border border-border/75 bg-background/72 p-5 shadow-[0_20px_50px_-40px_color-mix(in_srgb,var(--color-foreground)_40%,transparent)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_60px_-40px_color-mix(in_srgb,var(--color-primary)_32%,transparent)] ${
        isCurrent ? "relative sm:col-span-2" : "print:border-0 print:p-0"
      }`}
      href={exp.company.websiteUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {isCurrent ? (
        <div className="absolute top-4 right-4">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
          </span>
        </div>
      ) : null}
      <div className="flex items-start gap-3">
        <Avatar
          className={`rounded-2xl border border-white/80 bg-white/75 after:rounded-2xl ${isCurrent ? "" : "print:hidden"}`}
        >
          <AvatarImage
            alt={`${exp.company.name} logo`}
            className="rounded-2xl object-contain"
            src={exp.company.logoUrl}
          />
          <AvatarFallback className="rounded-2xl">
            {exp.company.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className={`flex-1 ${isCurrent ? "pr-6" : ""}`}>
          <H3 className="text-xl">{exp.title}</H3>
          <Small className="mt-1 font-mono font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {exp.company.name}
          </Small>
          {exp.description ? (
            <P className="mt-3 text-sm leading-7">{exp.description}</P>
          ) : null}
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        <Muted className="text-xs">
          {formatDate(exp.startDate)} –{" "}
          {isCurrent ? "Present" : formatDate(exp.endDate)} ·{" "}
          {formatDuration(exp.startDate, exp.endDate)}
          {" · "}
          {exp.location}
        </Muted>
        <Muted className="flex-shrink-0 text-xs">#{number}</Muted>
      </div>
    </a>
  );
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const currentExperience = experiences.at(0);
  const previousExperiences = experiences.slice(1);
  const totalCount = experiences.length;
  const totalExperience = calculateTotalExperience(experiences);

  return (
    <section>
      <div className="mb-5 flex items-center gap-2 print:mb-2">
        <Briefcase className="size-5" />
        <H2 className="border-0 py-0 text-2xl">Work</H2>
        <span className="text-muted-foreground">·</span>
        <Muted className="font-mono text-[0.72rem] tracking-[0.22em] uppercase">
          {totalExperience}
        </Muted>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {currentExperience ? (
          <JobCard isCurrent exp={currentExperience} number={totalCount} />
        ) : null}
        {previousExperiences.map((exp, index) => (
          <JobCard
            key={exp._id}
            exp={exp}
            isCurrent={false}
            number={totalCount - index - 1}
          />
        ))}
      </div>
    </section>
  );
}
