import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/projects/")({
  beforeLoad() {
    throw redirect({
      search: { section: "projects" },
      to: "/admin/resume",
    });
  },
});
