import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";

import { siteTitle } from "@/lib/seo";

export const Route = createFileRoute("/_without-user/sign-in")({
  async loader() {
    const signInUrl = await getSignInUrl({ data: "/app" });

    throw redirect({ href: signInUrl });
  },
  head: () => ({
    meta: [
      { title: `Sign in | ${siteTitle}` },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
