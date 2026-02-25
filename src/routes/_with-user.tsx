import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user")({
  beforeLoad({ context }) {
    const { isAuthenticated } = context;

    if (!isAuthenticated) {
      throw redirect({ to: "/get-started" });
    }

    return {
      isAuthenticated,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
