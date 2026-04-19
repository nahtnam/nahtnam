import { Coffee } from "lucide-react";
import { H1, Lead } from "@/components/ui/typography";

export function ContactHeader() {
  return (
    <div className="page-intro mb-8 text-center">
      <div className="mx-auto mb-6 flex size-[4.5rem] items-center justify-center rounded-[1.8rem] border border-primary/15 bg-primary/8">
        <Coffee className="size-8" />
      </div>
      <span className="eyebrow mb-4">Contact</span>
      <H1>Say hello</H1>
      <Lead className="mx-auto mt-3 max-w-md text-base">
        I&apos;m always happy to chat about tech, life, or anything in between.
        Whether you want to grab coffee or just say hi, feel free to reach out.
      </Lead>
    </div>
  );
}
