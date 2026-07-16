import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/admin/blog/$id/")({
  loader({ params }) {
    throw redirect({
      href: `/admin/writing?post=${encodeURIComponent(params.id)}`,
    });
  },
});
