import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/blog/")({
  loader() {
    throw redirect({ href: "/admin/writing" });
  },
});
