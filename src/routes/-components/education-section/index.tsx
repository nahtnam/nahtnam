import { GraduationCap } from "lucide-react";
import {
  H2,
  H3,
  Muted,
  Small,
} from "@/routes/-shadcn/components/ui/typography";

interface Education {
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
  details?: string;
}

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 print:mb-2">
        <GraduationCap className="size-5" />
        <H2 className="border-0 py-0 font-medium text-lg">Education</H2>
      </div>

      <div className="space-y-3">
        {education.map((edu) => (
          <div className="space-y-0.5" key={edu.school}>
            <H3 className="font-medium text-base">{edu.school}</H3>
            <Muted>
              {edu.degree} · {edu.startYear} – {edu.endYear}
            </Muted>
            {edu.details ? (
              <Small className="font-normal">{edu.details}</Small>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
