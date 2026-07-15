import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/_without-user")({
  async loader({ context }) {
    const auth = context.convexQueryClient.serverHttpClient
      ? await context.serverAuthState.wait()
      : await getAuth();
    const { user } = auth;

    if (user) {
      throw redirect({ to: "/app" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
