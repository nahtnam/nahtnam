/* eslint-disable sort-keys */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { siteTitle } from "@/lib/seo";

export const Route = createFileRoute("/sign-in")({
  async loader({ location }) {
    const redirectTo =
      new URLSearchParams(location.searchStr).get("redirectTo") ?? "/admin";
    const signInUrl = await getSignInUrl({
      data: redirectTo,
    });

    throw redirect({ href: signInUrl });
  },
  head: () => ({
    meta: [
      {
        title: `Sign in | ${siteTitle}`,
      },
      {
        content: "noindex, nofollow",
        name: "robots",
      },
    ],
  }),
});
