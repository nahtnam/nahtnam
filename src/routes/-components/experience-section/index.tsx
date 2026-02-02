import { differenceInMonths } from "date-fns";
import { Briefcase } from "lucide-react";
import { formatDate, formatDuration } from "@/routes/-components/date-utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/routes/-shadcn/components/ui/avatar";
import {
  H2,
  H3,
  Muted,
  P,
  Small,
} from "@/routes/-shadcn/components/ui/typography";

type Experience = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  description: string | null;
  company: {
    name: string;
    websiteUrl: string;
    logoUrl: string;
  };
};

type ExperienceSectionProps = {
  experiences: Experience[];
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
  exp: Experience;
  number: number;
  isCurrent: boolean;
}) {
  return (
    <a
      className={`flex flex-col rounded-lg border p-4 transition-colors hover:border-foreground/20 ${
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
          className={`rounded-md after:rounded-md ${isCurrent ? "" : "print:hidden"}`}
          size="lg"
        >
          <AvatarImage
            alt={`${exp.company.name} logo`}
            className="rounded-md object-contain"
            src={exp.company.logoUrl}
          />
          <AvatarFallback className="rounded-md">
            {exp.company.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className={`flex-1 ${isCurrent ? "pr-6" : ""}`}>
          <H3 className="font-medium text-base">{exp.title}</H3>
          <Small className="font-normal">{exp.company.name}</Small>
          {exp.description ? (
            <P className="mt-2 text-sm leading-relaxed">{exp.description}</P>
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
      <div className="mb-4 flex items-center gap-2 print:mb-2">
        <Briefcase className="size-5" />
        <H2 className="border-0 py-0 font-medium text-lg">Work</H2>
        <span className="text-muted-foreground">·</span>
        <Muted>{totalExperience}</Muted>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {currentExperience ? (
          <JobCard
            exp={currentExperience}
            isCurrent={true}
            number={totalCount}
          />
        ) : null}
        {previousExperiences.map((exp, index) => (
          <JobCard
            exp={exp}
            isCurrent={false}
            key={exp.id}
            number={totalCount - index - 1}
          />
        ))}
      </div>
    </section>
  );
}
