import { GraduationCap } from "lucide-react";
import { H2, H3, Muted, Small } from "@/components/ui/typography";

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
    <section>
      <div className="mb-5 flex items-center gap-2 print:mb-2">
        <GraduationCap className="size-5" />
        <H2 className="border-0 py-0 text-2xl">Education</H2>
      </div>

      <div className="space-y-4">
        {education.map((edu) => (
          <div
            key={edu.school}
            className="rounded-[1.8rem] border border-border/70 bg-background/70 p-5"
          >
            <H3 className="text-xl">{edu.school}</H3>
            <Muted className="mt-1 inline-block font-mono text-[0.72rem] tracking-[0.2em] uppercase">
              {edu.degree} · {edu.startYear} – {edu.endYear}
            </Muted>
            {edu.details ? (
              <Small className="mt-3 block font-normal leading-6">
                {edu.details}
              </Small>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
