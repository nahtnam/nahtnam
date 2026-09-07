/* oxlint-disable sonarjs/function-name -- TanStack names handlers after HTTP methods. */
import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { appUrl } from "@repo/config/app";
import { clientEnv } from "@repo/config/env/client";
import { serverEnv } from "@repo/config/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";

import {
  createMessageResponse,
  validateTwilioRequest,
} from "@/lib/twilio/server";

export const Route = createFileRoute("/api/twilio/ai-status")({
  server: {
    handlers: {
      async POST({ request }) {
        const authToken = serverEnv.TWILIO_AUTH_TOKEN;
        const secret = serverEnv.AI_AUTOMATION_SECRET;
        if (!authToken || !secret) {
          return new Response("Webhook unavailable", { status: 503 });
        }
        const deliveryId = new URL(request.url).searchParams.get("deliveryId");
        if (!deliveryId || deliveryId.length > 100) {
          return new Response("Invalid delivery", { status: 400 });
        }
        const url = new URL("/api/twilio/ai-status", appUrl);
        url.searchParams.set("deliveryId", deliveryId);
        const validation = await validateTwilioRequest({
          authToken,
          request,
          url: url.toString(),
        });
        if (validation.response) {
          return validation.response;
        }
        const providerId = validation.parameters.get("MessageSid");
        const status = validation.parameters.get("MessageStatus");
        if (
          providerId &&
          (status === "delivered" ||
            status === "failed" ||
            status === "undelivered")
        ) {
          const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
          await convex.mutation(api["ai_delivery"].recordStatus, {
            id: deliveryId as Id<"aiSmsDeliveries">,
            providerId,
            secret,
            status: status === "delivered" ? "delivered" : "failed",
          });
        }
        return createMessageResponse({});
      },
    },
  },
});
