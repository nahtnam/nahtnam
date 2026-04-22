import { createFileRoute } from "@tanstack/react-router";
import { getAuthkit } from "@workos/authkit-tanstack-react-start";
import { appUrl } from "@/lib/config";

const getHeaders = (
  result: Awaited<
    ReturnType<Awaited<ReturnType<typeof getAuthkit>>["handleCallback"]>
  >,
) => {
  const setCookie = result.response?.headers.get("Set-Cookie");

  if (setCookie) {
    return { "Set-Cookie": setCookie };
  }

  if (result.headers && typeof result.headers === "object") {
    return result.headers;
  }

  return {};
};

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      async GET({ request }) {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code) {
          return Response.json(
            { error: { message: "Missing authorization code" } },
            { status: 400 },
          );
        }

        try {
          const authkit = await getAuthkit();
          const result = await authkit.handleCallback(request, new Response(), {
            code,
            state: state ?? undefined,
          });
          const redirectUrl = new URL(result.returnPathname, appUrl);

          return new Response(null, {
            headers: {
              Location: redirectUrl.toString(),
              ...getHeaders(result),
            },
            status: 307,
          });
        } catch (error) {
          console.error("OAuth callback failed:", error);

          return Response.json(
            {
              error: {
                description:
                  "Couldn't sign in. Please contact your organization admin if the issue persists.",
                details: error instanceof Error ? error.message : String(error),
                message: "Authentication failed",
              },
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
