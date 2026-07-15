import { serverEnv } from "@repo/config/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { handleCallbackRoute } from "@workos/authkit-tanstack-react-start";

import { captureServerException } from "@/lib/posthog/posthog.server";

const AUTH_CALLBACK_ROUTE = "/api/auth/callback";
const authCallbackOrigin = new URL(serverEnv.WORKOS_REDIRECT_URI).origin;

const handleAuthCallback = handleCallbackRoute({
  onError: handleAuthCallbackError,
  returnPathname: "/app",
});

type AuthCallbackError = {
  error?: unknown;
};

async function handleAuthCallbackError(params: AuthCallbackError) {
  const { error } = params;
  await reportAuthError(error);

  return authErrorResponse();
}

async function reportAuthError(error: unknown) {
  try {
    await captureServerException(error, {
      route: AUTH_CALLBACK_ROUTE,
    });
  } catch {
    // Reporting failures must not replace the authentication response.
  }
}

function authErrorResponse() {
  return Response.json(
    {
      error: {
        description:
          "Couldn't sign in. Please contact your organization admin if the issue persists.",
        message: "Authentication failed",
      },
    },
    { status: 500 }
  );
}

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      // oxlint-disable-next-line sonarjs/function-name
      async GET(args) {
        try {
          const response = await handleAuthCallback(args);

          if (response.status < 300 || response.status >= 400) {
            return response;
          }

          const location = response.headers.get("Location");

          if (!location) {
            return response;
          }

          const currentUrl = new URL(location, authCallbackOrigin);
          const redirectUrl = new URL(
            `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
            authCallbackOrigin
          );
          const headers = new Headers(response.headers);
          headers.set("Location", redirectUrl.toString());

          return new Response(response.body, {
            headers,
            status: response.status,
            statusText: response.statusText,
          });
        } catch (error) {
          await reportAuthError(error);

          return authErrorResponse();
        }
      },
    },
  },
});
