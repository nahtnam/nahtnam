import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_without-user")({
  beforeLoad({ context }) {
    const { isAuthenticated } = context;

    if (isAuthenticated) {
      throw redirect({ to: "/app" });
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
