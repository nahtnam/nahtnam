/* oxlint-disable vitest/prefer-import-in-mock -- Boundary tests intentionally provide minimal route and transport stubs. */
import { receiptPhoneNumber } from "@repo/config/app";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { Route } from "../sms";

const { mutation, parameters, secrets } = vi.hoisted(() => ({
  mutation:
    vi.fn<
      (
        name: string,
        input: Record<string, unknown>
      ) => Promise<{ handled?: boolean; reply?: string; status?: string }>
    >(),
  parameters: new URLSearchParams(),
  secrets: {
    AI_AUTOMATION_SECRET: "ai-secret",
    PRINT_SECRET: "print-secret",
    TWILIO_AUTH_TOKEN: "twilio-token",
  } as {
    AI_AUTOMATION_SECRET?: string;
    PRINT_SECRET: string;
    TWILIO_AUTH_TOKEN: string;
  },
}));

vi.mock("@repo/backend/api", () => ({
  api: { ai: { sms: "ai:sms" } },
}));
vi.mock("@repo/backend/print", () => ({
  printJobFunctions: { createTextMessage: "print:createTextMessage" },
}));
vi.mock("@repo/config/env/client", () => ({
  clientEnv: { VITE_CONVEX_URL: "https://example.convex.cloud" },
}));
vi.mock("@repo/config/env/server", () => ({ serverEnv: secrets }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
}));
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    mutation = mutation;
  },
}));
vi.mock("@/lib/twilio/server", () => ({
  createMessageResponse: (value: unknown) => Response.json(value),
  validateTwilioRequest: () => Promise.resolve({ parameters }),
}));

const post = (
  Route as unknown as {
    server: {
      handlers: { POST: (input: { request: Request }) => Promise<Response> };
    };
  }
).server.handlers.POST;

function receive() {
  return post({
    request: new Request("https://www.nahtnam.com/api/twilio/sms", {
      method: "POST",
    }),
  });
}

describe("authenticated incoming SMS boundary", () => {
  beforeEach(() => {
    mutation.mockReset();
    parameters.set("Body", "Hello");
    parameters.set("From", "+15555550123");
    parameters.set("MessageSid", "SM-test-message");
    parameters.set("To", receiptPhoneNumber);
    secrets.AI_AUTOMATION_SECRET = "ai-secret";
  });

  test("stores the owner's exact body, including whitespace and line endings", async () => {
    const body = `  Please wait until Friday.\r\n\r\n\r\n${"details ".repeat(60)}  `;
    parameters.set("Body", body);
    mutation.mockResolvedValue({ handled: true, reply: "Saved." });
    const response = await receive();
    expect(mutation).toHaveBeenCalledExactlyOnceWith("ai:sms", {
      body,
      from: "+15555550123",
      messageSid: "SM-test-message",
      secret: "ai-secret",
    });
    await expect(response.json()).resolves.toStrictEqual({ message: "Saved." });
  });

  test("keeps public printing limited to 320 normalized characters", async () => {
    parameters.set("Body", "x".repeat(321));
    mutation.mockResolvedValue({ handled: false });
    const response = await receive();
    await expect(response.json()).resolves.toStrictEqual({});
    expect(mutation).toHaveBeenCalledOnce();
  });

  test("preserves public text-to-print after verifying a non-owner", async () => {
    parameters.set("Body", "  Hello\r\n\r\n\r\nfriend  ");
    mutation
      .mockResolvedValueOnce({ handled: false })
      .mockResolvedValueOnce({ status: "queued" });
    const response = await receive();
    await expect(response.json()).resolves.toStrictEqual({
      message: "QUEUED",
    });
    expect(mutation).toHaveBeenLastCalledWith("print:createTextMessage", {
      body: "Hello\n\nfriend",
      from: "+15555550123",
      messageSid: "SM-test-message",
      secret: "print-secret",
    });
  });

  test("never prints a reply when AI access is missing", async () => {
    delete secrets.AI_AUTOMATION_SECRET;
    const response = await receive();
    expect(response.status).toBe(503);
    expect(mutation).not.toHaveBeenCalled();
  });

  test("never prints a reply after an uncertain backend failure", async () => {
    mutation.mockRejectedValue(new Error("No confirmed response"));
    await expect(receive()).rejects.toThrow("No confirmed response");
    expect(mutation).toHaveBeenCalledOnce();
  });

  test("rejects oversized replies before a database call", async () => {
    parameters.set("Body", "x".repeat(4001));
    const response = await receive();
    await expect(response.json()).resolves.toStrictEqual({});
    expect(mutation).not.toHaveBeenCalled();
  });
});
