import { createFileRoute } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/api/auth/sign-in")({
  server: {
    handlers: {
      // oxlint-disable-next-line sonarjs/function-name
      async GET() {
        const signInUrl = await getSignInUrl();

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
