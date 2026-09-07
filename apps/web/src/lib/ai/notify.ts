import { api } from "@repo/backend/api";
import { appUrl, receiptPhoneNumber } from "@repo/config/app";
import { serverEnv } from "@repo/config/env/server";
import type { ConvexHttpClient } from "convex/browser";
import twilio from "twilio";

export async function notifyUrgentItem(options: {
  code: string;
  convex: ConvexHttpClient;
  expectedVersion: number;
  idempotencyKey: string;
  secret: string;
}) {
  const { convex, secret, code, expectedVersion, idempotencyKey } = options;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = serverEnv;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Outbound SMS is not configured.");
  }
  const delivery = await convex.mutation(api["ai-delivery"].reserve, {
    code,
    expectedVersion,
    idempotencyKey,
    secret,
  });
  if (!delivery.send) {
    return { id: delivery.id, status: delivery.status };
  }
  const statusCallback = new URL("/api/twilio/ai-status", appUrl);
  statusCallback.searchParams.set("deliveryId", delivery.id);
  let providerId: string;
  try {
    const itemUrl = new URL(`/ai/item/${delivery.code}`, appUrl).toString();
    const message = await twilio(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    ).messages.create({
      body: `${delivery.body}\n${itemUrl}`,
      from: receiptPhoneNumber,
      statusCallback: statusCallback.toString(),
      to: delivery.phone,
    });
    providerId = message.sid;
  } catch {
    // A timeout can happen after Twilio accepts the message. Keep the reservation
    // and require provider readback instead of risking a duplicate urgent text.
    await convex.mutation(api["ai-delivery"].settle, {
      id: delivery.id,
      secret,
      status: "unknown",
    });
    return { id: delivery.id, status: "unknown" };
  }
  const result = await convex.mutation(api["ai-delivery"].settle, {
    id: delivery.id,
    providerId,
    secret,
    status: "sent",
  });
  return { id: delivery.id, status: result.status };
}
