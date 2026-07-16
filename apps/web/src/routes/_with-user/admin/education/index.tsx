import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/education/")({
  beforeLoad() {
    throw redirect({
      search: { section: "education" },
      to: "/admin/resume",
    });
  },
});
