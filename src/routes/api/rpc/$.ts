import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@/server/handler";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await handler.handle(request, {
          context: {}, // Provide initial context if needed
          prefix: "/api/rpc",
        });

        return response ?? new Response("Not Found", { status: 404 });
      },
    },
  },
});
