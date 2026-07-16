import { api } from "@repo/backend/api";
import { clientEnv } from "@repo/config/env/client";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

const contactRequestSchema = z.object({
  email: z.email().max(320),
  message: z.string().trim().min(1).max(3000),
  name: z.string().trim().min(1).max(100),
  turnstileToken: z.string().min(1).max(4096),
});

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      // TanStack Start names HTTP method handlers with uppercase keys.
      // oxlint-disable-next-line sonarjs/function-name
      async POST({ request }) {
        if (!isSameOriginRequest(request)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json(
            { error: "The contact form was not valid." },
            { status: 400 }
          );
        }

        const parsed = contactRequestSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            {
              error:
                parsed.error.issues[0]?.message ??
                "The contact form was not valid.",
            },
            { status: 400 }
          );
        }

        try {
          const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
          await convex.action(api.contact.actions.sendMessage, parsed.data);

          return Response.json(
            { success: true },
            { headers: { "Cache-Control": "private, no-store" } }
          );
        } catch {
          return Response.json(
            {
              error:
                "Your message could not be sent. Refresh the verification and try again.",
            },
            { status: 502 }
          );
        }
      },
    },
  },
});

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  return origin === new URL(request.url).origin;
}
