/* oxlint-disable sonarjs/function-name -- TanStack names server handlers after HTTP methods. */
import { printJobFunctions } from "@repo/backend/print";
import type { CreatePrintJobResult } from "@repo/backend/print";
import { clientEnv } from "@repo/config/env/client";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

const printRequestSchema = z.object({
  availableAt: z.number().optional(),
  idempotencyKey: z.string().min(1).max(200).optional(),
  payload: z.discriminatedUnion("_type", [
    z.object({
      _type: z.literal("message"),
      body: z.string().min(1).max(4000),
      title: z.string().min(1).max(200).optional(),
    }),
    z.object({
      _type: z.literal("alert"),
      body: z.string().min(1).max(4000),
      title: z.string().min(1).max(200),
    }),
  ]),
  source: z.string().min(1).max(100).default("api"),
});

export const Route = createFileRoute("/api/print")({
  server: {
    handlers: {
      async POST({ request }) {
        const token = getBearerToken({ request });
        if (!token) {
          return Response.json(
            { error: { message: "Unauthorized" } },
            { status: 401 }
          );
        }

        const body = await readJson(request);
        if (!body.success) {
          return invalidPrintRequest("Request body must be valid JSON.");
        }

        const parsed = printRequestSchema.safeParse(body.data);
        if (!parsed.success) {
          return invalidPrintRequest(parsed.error.message);
        }

        const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
        let job: CreatePrintJobResult;

        try {
          job = await convex.mutation(printJobFunctions.create, {
            ...parsed.data,
            secret: token,
          });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Unauthorized")
          ) {
            return Response.json(
              { error: { message: "Unauthorized" } },
              { status: 401 }
            );
          }

          throw error;
        }

        return Response.json({ job });
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

function invalidPrintRequest(details: string) {
  return Response.json(
    {
      error: {
        details,
        message: "Invalid print request",
      },
    },
    { status: 400 }
  );
}

function getBearerToken(options: { request: Request }) {
  const { request } = options;
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return;
  }

  return authorization.slice("Bearer ".length);
}
