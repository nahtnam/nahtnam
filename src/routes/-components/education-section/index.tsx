type Education = {
  degree: string;
  details?: string;
  endYear: string;
  school: string;
  startYear: string;
};

type EducationSectionProps = {
  readonly education: Education[];
};

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section className="print:break-inside-avoid">
      <div className="mb-8 flex items-baseline gap-4 print:mb-4">
        <span className="font-mono text-[0.7rem] font-semibold tracking-[0.2em] text-primary">
          03
        </span>
        <h2 className="font-serif text-3xl tracking-[-0.02em]">Education</h2>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card print:border">
        {education.map((edu) => (
          <div
            key={edu.school}
            className="flex flex-col gap-2 p-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight">
                {edu.school}
              </h3>
              <p className="mt-1 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
                {edu.degree}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="font-mono text-sm text-foreground/70">
                {edu.startYear} – {edu.endYear}
              </p>
              {edu.details ? (
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {edu.details}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
