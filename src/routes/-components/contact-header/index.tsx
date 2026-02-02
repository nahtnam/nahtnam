import { Coffee } from "lucide-react";
import { H1, Lead } from "@/routes/-shadcn/components/ui/typography";

export function ContactHeader() {
  return (
    <div className="mb-10 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Coffee className="size-8" />
      </div>
      <H1 className="font-semibold text-3xl">Say hello</H1>
      <Lead className="mx-auto mt-3 max-w-md text-base">
        I&apos;m always happy to chat about tech, life, or anything in between.
        Whether you want to grab coffee or just say hi, feel free to reach out.
      </Lead>
    </div>
  );
}
