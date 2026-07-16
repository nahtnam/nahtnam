import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/experiences/")({
  beforeLoad() {
    throw redirect({
      search: { section: "experience" },
      to: "/admin/resume",
    });
  },
});
