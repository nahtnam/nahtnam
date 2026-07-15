import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/_with-user")({
  async loader({ context }) {
    const auth = context.convexQueryClient.serverHttpClient
      ? await context.serverAuthState.wait()
      : await getAuth();
    const { user } = auth;

    if (!user) {
      throw redirect({
        href: "/api/auth/sign-in",
      });
    }

    return { user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
