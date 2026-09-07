import { createFileRoute } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/api/auth/sign-in")({
  server: {
    handlers: {
      // oxlint-disable-next-line sonarjs/function-name
      async GET() {
        const signInUrl = await getSignInUrl({
          data: { returnPathname: "/app" },
        });

        return new Response(null, {
          headers: {
            Location: signInUrl,
          },
          status: 307,
        });
      },
    },
  },
});
