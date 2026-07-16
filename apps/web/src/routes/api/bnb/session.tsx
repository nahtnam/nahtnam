/* oxlint-disable sonarjs/function-name -- TanStack names server handlers after HTTP methods. */
import { api } from "@repo/backend/api";
import { clientEnv } from "@repo/config/env/client";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

import {
  clearBnbSessionCookie,
  createBnbSessionCookie,
  isSameOriginRequest,
} from "@/lib/bnb/session.server";

const sessionSchema = z.object({
  password: z.string().min(1).max(200),
});

export const Route = createFileRoute("/api/bnb/session")({
  server: {
    handlers: {
      DELETE({ request }) {
        if (!isSameOriginRequest(request)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        return Response.json(
          { success: true },
          { headers: { "Set-Cookie": clearBnbSessionCookie() } }
        );
      },
      async POST({ request }) {
        if (!isSameOriginRequest(request)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await readJson(request);
        if (!body.success) {
          return Response.json(
            { error: "Request body must be valid JSON." },
            { status: 400 }
          );
        }

        const parsed = sessionSchema.safeParse(body.data);
        if (!parsed.success) {
          return Response.json(
            { error: "Enter the secret password." },
            { status: 400 }
          );
        }

        const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);

        try {
          await convex.action(api.bnb.actions.verifyPassword, parsed.data);
        } catch {
          return Response.json({ error: "Wrong password." }, { status: 401 });
        }

        return Response.json(
          { success: true },
          {
            headers: {
              "Set-Cookie": createBnbSessionCookie({
                password: parsed.data.password,
              }),
            },
          }
        );
      },
    },
  },
});

async function readJson(request: Request) {
  try {
    return { data: (await request.json()) as unknown, success: true as const };
  } catch {
    return { success: false as const };
  }
}
