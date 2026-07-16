/* oxlint-disable sonarjs/function-name -- TanStack names server handlers after HTTP methods. */
import { printJobFunctions } from "@repo/backend/print";
import { appUrl } from "@repo/config/app";
import { clientEnv } from "@repo/config/env/client";
import { serverEnv } from "@repo/config/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";

import {
  createMessageResponse,
  validateTwilioRequest,
} from "@/lib/twilio/server";

const MAX_TEXT_MESSAGE_LENGTH = 320;
const RECEIPT_PHONE_NUMBER = "+18556248626";
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

  if (!body || body.length > MAX_TEXT_MESSAGE_LENGTH) {
    return false;
  }

  if (!from || from.length > 80) {
    return false;
  }

  if (!messageSid || messageSid.length > 80) {
    return false;
  }

  return to === RECEIPT_PHONE_NUMBER;
}

export const Route = createFileRoute("/api/twilio/sms")({
  server: {
    handlers: {
      async POST({ request }) {
        const authToken = serverEnv.TWILIO_AUTH_TOKEN;
        const printSecret = serverEnv.PRINT_SECRET;

        if (!authToken || !printSecret) {
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
        const body = normalizeMessageBody(parameters.get("Body") ?? "");
        const from = parameters.get("From") ?? "";
        const messageSid =
          parameters.get("MessageSid") ?? parameters.get("SmsSid") ?? "";
        const to = parameters.get("To") ?? "";

        if (!isValidIncomingMessage({ body, from, messageSid, to })) {
          return createMessageResponse({});
        }

        const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
        const job = await convex.mutation(printJobFunctions.createTextMessage, {
          body,
          from,
          messageSid,
          secret: printSecret,
        });

        return createMessageResponse({
          message: job.status === "queued" ? "PRINTED" : undefined,
        });
      },
    },
  },
});
