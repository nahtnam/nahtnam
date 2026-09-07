import type { ConvexHttpClient } from "convex/browser";
import type twilio from "twilio";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { notifyUrgentItem } from "../notify";

const { create, mutation, serverEnv } = vi.hoisted(() => ({
  create: vi.fn<() => Promise<{ sid: string }>>(),
  mutation: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  serverEnv: {
    TWILIO_ACCOUNT_SID: "test-sid",
    TWILIO_AUTH_TOKEN: "test-token",
    WORKOS_API_KEY: "test-key",
    WORKOS_CLIENT_ID: "test-client",
    WORKOS_COOKIE_PASSWORD: "x".repeat(32),
    WORKOS_REDIRECT_URI: "https://www.nahtnam.com/api/auth/callback",
  },
}));
vi.mock(import("@repo/config/env/server"), () => ({ serverEnv }));
vi.mock(import("@repo/config/app"), async (importOriginal) => ({
  ...(await importOriginal()),
  appUrl: "https://www.nahtnam.com" as const,
}));
vi.mock(import("twilio"), () => ({
  default: (() => ({
    messages: { create },
  })) as unknown as typeof twilio,
}));

const options = {
  code: "A7",
  convex: { mutation } as unknown as ConvexHttpClient,
  expectedVersion: 2,
  idempotencyKey: "one-incident",
  secret: "test-ai-secret",
};
const reservation = {
  body: "Urgent: appointment changed",
  code: "A7",
  id: "delivery-one",
  phone: "+15555550123",
  send: true,
  status: "reserved",
};

describe("urgent SMS provider boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    serverEnv.TWILIO_ACCOUNT_SID = "test-sid";
  });

  test("does not reserve or contact the provider without outbound configuration", async () => {
    serverEnv.TWILIO_ACCOUNT_SID = "";
    await expect(notifyUrgentItem(options)).rejects.toThrow("not configured");
    expect(mutation).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  test("does not resend an existing delivery reservation", async () => {
    mutation.mockResolvedValueOnce({
      id: reservation.id,
      send: false,
      status: "unknown",
    });
    const result = await notifyUrgentItem(options);
    expect(result).toStrictEqual({ id: reservation.id, status: "unknown" });
    expect(create).not.toHaveBeenCalled();
  });

  test("sends to the reserved owner phone and preserves early delivery confirmation", async () => {
    mutation
      .mockResolvedValueOnce(reservation)
      .mockResolvedValueOnce({ status: "delivered" });
    create.mockResolvedValueOnce({ sid: "SM-one" });
    const result = await notifyUrgentItem(options);
    expect(create).toHaveBeenCalledExactlyOnceWith({
      body: "Urgent: appointment changed\nhttps://www.nahtnam.com/ai/item/A7",
      from: "+18556248626",
      statusCallback:
        "https://www.nahtnam.com/api/twilio/ai-status?deliveryId=delivery-one",
      to: reservation.phone,
    });
    expect(mutation).toHaveBeenLastCalledWith(expect.anything(), {
      id: reservation.id,
      providerId: "SM-one",
      secret: options.secret,
      status: "sent",
    });
    expect(result).toStrictEqual({ id: reservation.id, status: "delivered" });
  });

  test("keeps uncertain sends reserved without retrying or claiming delivery", async () => {
    mutation
      .mockResolvedValueOnce(reservation)
      .mockResolvedValueOnce({ status: "unknown" });
    create.mockRejectedValueOnce(new Error("Connection timed out"));
    const result = await notifyUrgentItem(options);
    expect(create).toHaveBeenCalledOnce();
    expect(mutation).toHaveBeenLastCalledWith(expect.anything(), {
      id: reservation.id,
      secret: options.secret,
      status: "unknown",
    });
    expect(result).toStrictEqual({ id: reservation.id, status: "unknown" });
  });
});
