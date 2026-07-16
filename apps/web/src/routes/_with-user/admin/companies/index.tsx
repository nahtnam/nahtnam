import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/companies/")({
  beforeLoad() {
    throw redirect({
      search: { section: "companies" },
      to: "/admin/resume",
    });
  },
});
