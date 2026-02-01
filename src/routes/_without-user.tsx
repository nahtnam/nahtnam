import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_without-user")({
  beforeLoad: ({ context }) => {
    const { user } = context;

    if (user) {
      throw redirect({ to: "/app" });
    }

    return {
      user,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
