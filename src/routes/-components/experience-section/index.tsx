import { differenceInMonths } from "date-fns";
import { formatDate, formatDuration } from "@/routes/-components/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Company = {
  _id: string;
  logoUrl: string;
  name: string;
  websiteUrl: string;
};

type Experience = {
  _id: string;
  company: Company;
  description?: string;
  endDate?: number;
  location: string;
  startDate: number;
  title: string;
};

type ExperienceSectionProps = {
  readonly experiences: Experience[];
};

type CompanyGroup = {
  company: Company;
  isCurrent: boolean;
  roles: Experience[];
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

function groupByCompany(experiences: Experience[]): CompanyGroup[] {
  const groups = new Map<string, CompanyGroup>();
  for (const exp of experiences) {
    const existing = groups.get(exp.company._id);
    if (existing) {
      existing.roles.push(exp);
    } else {
      groups.set(exp.company._id, {
        company: exp.company,
        isCurrent: !exp.endDate,
        roles: [exp],
      });
    }
  }

  return [...groups.values()];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const totalExperience = calculateTotalExperience(experiences);
  const groups = groupByCompany(experiences);
  const totalCount = experiences.length;

  return (
    <section className="print:break-inside-avoid">
      <div className="mb-8 flex items-baseline gap-4 print:mb-4">
        <span className="font-mono text-[0.7rem] font-semibold tracking-[0.2em] text-primary">
          01
        </span>
        <h2 className="font-serif text-3xl tracking-[-0.02em]">Work</h2>
        <span className="ml-auto font-mono text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
          {totalExperience} · {totalCount} roles · ↓ recent
        </span>
      </div>

      <div className="gap-4 [column-fill:_balance] md:columns-2">
        {groups.map((group, index) => (
          <CompanyCard
            key={group.company._id}
            group={group}
            index={index + 1}
          />
        ))}
      </div>
    </section>
  );
}

function CompanyCard({
  group,
  index,
}: {
  readonly group: CompanyGroup;
  readonly index: number;
}) {
  const { company, isCurrent, roles } = group;
  const sortedRoles = [...roles].sort((a, b) => b.startDate - a.startDate);

  const earliestStart =
    sortedRoles.at(-1)?.startDate ?? sortedRoles[0]!.startDate;
  const endYears = roles
    .map((role) => role.endDate)
    .filter((end): end is number => typeof end === "number");
  const latestEnd = endYears.length > 0 ? Math.max(...endYears) : undefined;
  const startYear = new Date(earliestStart).getFullYear();
  const endLabel = isCurrent
    ? "Present"
    : latestEnd
      ? new Date(latestEnd).getFullYear()
      : "Present";

  return (
    <a
      className={`mb-4 block break-inside-avoid rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 print:border print:bg-transparent ${
        isCurrent ? "border-primary/30" : "border-border"
      }`}
      href={company.websiteUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="font-mono text-[0.7rem] font-semibold tabular-nums text-muted-foreground/70">
          {String(index).padStart(2, "0")}
        </span>
        <Avatar className="size-10 shrink-0 rounded-lg border border-border bg-white print:hidden">
          <AvatarImage
            alt={`${company.name} logo`}
            className="rounded-lg object-contain"
            src={company.logoUrl}
          />
          <AvatarFallback className="rounded-lg text-sm">
            {company.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold tracking-tight">
              {company.name}
            </h3>
            {isCurrent ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 font-mono text-[0.58rem] font-medium tracking-[0.1em] text-green-600 uppercase">
                <span className="size-1.5 rounded-full bg-green-500" />
                Now
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-[0.72rem] font-medium tracking-wide text-foreground/75">
            {startYear} &mdash; {endLabel}
            <span className="ml-2 font-normal text-muted-foreground">
              · {sortedRoles.length} role{sortedRoles.length === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-4">
        {sortedRoles.map((role) => (
          <li key={role._id} className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="font-medium tracking-tight">{role.title}</p>
              <p className="font-mono text-[0.64rem] tracking-wide text-muted-foreground">
                {formatDuration(role.startDate, role.endDate)}
              </p>
            </div>
            <p className="font-mono text-[0.64rem] tracking-[0.1em] text-muted-foreground/80 uppercase">
              {formatDate(role.startDate)} –{" "}
              {role.endDate ? formatDate(role.endDate) : "Present"} ·{" "}
              {role.location}
            </p>
            {role.description ? (
              <p className="text-[0.82rem] leading-6 text-foreground/72">
                {role.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </a>
  );
}
