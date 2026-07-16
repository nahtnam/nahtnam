import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/blog/categories/")({
  loader() {
    throw redirect({ href: "/admin/writing?section=categories" });
  },
});
