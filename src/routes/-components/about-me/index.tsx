import { Lead } from "@/components/ui/typography";

const chips = [
  { emoji: "🚀", label: "indie hacker" },
  { emoji: "🏸", label: "badminton player" },
];

export function AboutMe() {
  return (
    <>
      <Lead className="max-w-xl text-balance text-center text-foreground/70">
        Software Engineer with experience at high-growth startups. Building
        things that matter.
      </Lead>

      <div className="flex items-center justify-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[0.72rem] font-medium tracking-wide text-foreground/80 whitespace-nowrap"
          >
            <span className="text-sm">{chip.emoji}</span>
            {chip.label}
          </span>
        ))}
      </div>
    </>
  );
}
