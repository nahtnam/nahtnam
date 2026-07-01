import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import z from "zod";
import { clientEnv } from "@/lib/config/client";
import {
  type CreatePrintJobResult,
  printJobFunctions,
} from "@/lib/print/function-references";

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

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorization.slice("Bearer ".length);
};

export const Route = createFileRoute("/api/print")({
  server: {
    handlers: {
      async POST({ request }) {
        const token = getBearerToken(request);

        if (!token) {
          return Response.json(
            { error: { message: "Unauthorized" } },
            { status: 401 },
          );
        }

        let payload: z.infer<typeof printRequestSchema>;

        try {
          payload = printRequestSchema.parse(await request.json());
        } catch (error) {
          return Response.json(
            {
              error: {
                details: error instanceof Error ? error.message : String(error),
                message: "Invalid print request",
              },
            },
            { status: 400 },
          );
        }

        const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
        let job: CreatePrintJobResult;

        try {
          job = await convex.mutation(printJobFunctions.create, {
            ...payload,
            secret: token,
          });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Unauthorized")
          ) {
            return Response.json(
              { error: { message: "Unauthorized" } },
              { status: 401 },
            );
          }

          throw error;
        }

        return Response.json({ job });
      },
    },
  },
});
