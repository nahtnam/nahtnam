import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/_with-user")({
  async loader({ context, location }) {
    const auth = context.convexQueryClient.serverHttpClient
      ? await context.serverAuthState.wait()
      : await getAuth();
    const { user } = auth;

    if (!user) {
      const isAdminRoute =
        location.pathname === "/admin" ||
        location.pathname.startsWith("/admin/");

      throw redirect({
        href: isAdminRoute ? "/api/auth/admin" : "/api/auth/sign-in",
      });
    }

    return { user };
  },
  component: RouteComponent,
  head: () => ({
    meta: [{ content: "noindex, nofollow", name: "robots" }],
  }),
});

function RouteComponent() {
  return <Outlet />;
}
