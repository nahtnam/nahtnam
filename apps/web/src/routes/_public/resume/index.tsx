import { createFileRoute, redirect } from "@tanstack/react-router";

import { defaultResumeVariant } from "@/lib/resume/variants";

export const Route = createFileRoute("/_public/resume/")({
  loader() {
    throw redirect({ href: `/resume/${defaultResumeVariant}` });
  },
});
