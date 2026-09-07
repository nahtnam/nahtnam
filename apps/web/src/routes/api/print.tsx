/* oxlint-disable sonarjs/function-name -- TanStack names server handlers after HTTP methods. */
import { printJobFunctions } from "@repo/backend/print";
import { clientEnv } from "@repo/config/env/client";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";

import { handlePrintRequest } from "@/lib/print/server";

function handle(request: Request) {
  const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
  return handlePrintRequest(request, {
    cancel: (args) => convex.mutation(printJobFunctions.cancel, args),
    create: (args) => convex.mutation(printJobFunctions.create, args),
    getStatus: (args) => convex.query(printJobFunctions.getStatus, args),
    retry: (args) => convex.mutation(printJobFunctions.retry, args),
  });
}

export const Route = createFileRoute("/api/print")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      PATCH: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
