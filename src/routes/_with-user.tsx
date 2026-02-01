import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-user")({
  beforeLoad: ({ context }) => {
    const { user } = context;

    if (!user) {
      throw redirect({ to: "/get-started" });
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
