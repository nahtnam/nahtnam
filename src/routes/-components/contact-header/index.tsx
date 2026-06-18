import { H1, Lead } from "@/components/ui/typography";

export function ContactHeader() {
  return (
    <div className="page-intro">
      <span className="eyebrow mb-4">Contact</span>
      <H1>Say hello</H1>
      <Lead className="mt-4 max-w-md text-base">
        I&apos;m always happy to chat about tech, life, or anything in between.
        Whether you want to grab coffee or just say hi, feel free to reach out.
      </Lead>
    </div>
  );
}
