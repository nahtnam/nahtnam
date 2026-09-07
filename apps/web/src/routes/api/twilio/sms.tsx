/* oxlint-disable sonarjs/function-name -- TanStack names server handlers after HTTP methods. */
import { api } from "@repo/backend/api";
import { printJobFunctions } from "@repo/backend/print";
import { appUrl, receiptPhoneNumber } from "@repo/config/app";
import { clientEnv } from "@repo/config/env/client";
import { serverEnv } from "@repo/config/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";

import { routeIncomingText } from "@/lib/ai/sms-router";
import {
  createMessageResponse,
  validateTwilioRequest,
} from "@/lib/twilio/server";

const MAX_TEXT_MESSAGE_LENGTH = 320;
const MAX_REPLY_LENGTH = 4000;
const WEBHOOK_URL = new URL("/api/twilio/sms", appUrl).toString();

type IncomingMessage = {
  body: string;
  from: string;
  messageSid: string;
  to: string;
};

function normalizeMessageBody(body: string) {
  return body
    .replaceAll("\r\n", "\n")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .trim();
}

function isValidIncomingMessage(options: IncomingMessage) {
  const { body, from, messageSid, to } = options;

  if (!body.trim() || body.length > MAX_REPLY_LENGTH) {
    return false;
  }

  if (!from || from.length > 80) {
    return false;
  }

  if (!messageSid || messageSid.length > 80) {
    return false;
  }

  return to === receiptPhoneNumber;
}

export const Route = createFileRoute("/api/twilio/sms")({
  server: {
    handlers: {
      async POST({ request }) {
        const authToken = serverEnv.TWILIO_AUTH_TOKEN;
        const printSecret = serverEnv.PRINT_SECRET;
        const secret = serverEnv.AI_AUTOMATION_SECRET;

        if (!authToken || !secret) {
          return new Response("Webhook unavailable", { status: 503 });
        }

        const validation = await validateTwilioRequest({
          authToken,
          request,
          url: WEBHOOK_URL,
        });

        if (validation.response) {
          return validation.response;
        }

        const { parameters } = validation;
        const body = parameters.get("Body") ?? "";
        const from = parameters.get("From") ?? "";
        const messageSid =
          parameters.get("MessageSid") ?? parameters.get("SmsSid") ?? "";
        const to = parameters.get("To") ?? "";

        if (!isValidIncomingMessage({ body, from, messageSid, to })) {
          return createMessageResponse({});
        }

        const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
        const result = await routeIncomingText({
          body,
          async receive() {
            return await convex.mutation(api.ai.sms, {
              body,
              from,
              messageSid,
              secret,
            });
          },
          async print() {
            const printableBody = normalizeMessageBody(body);
            if (printableBody.length > MAX_TEXT_MESSAGE_LENGTH) {
              return { status: "ignored" };
            }
            if (!printSecret) {
              throw new Error("Printer access is not configured.");
            }
            return await convex.mutation(printJobFunctions.createTextMessage, {
              body: printableBody,
              from,
              messageSid,
              secret: printSecret,
            });
          },
        });
        return createMessageResponse(result);
      },
    },
  },
});
