import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user/app/")({
  loader() {
    throw redirect({ to: "/admin" });
  },
});
