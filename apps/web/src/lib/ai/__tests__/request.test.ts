import { describe, expect, test } from "vitest";

import { authorizeAiRequest, readAiRequest } from "../request";

describe("automation API boundary", () => {
  test.each(["actions", "brief", "timed"])(
    "accepts the %s receipt mode",
    async (mode) => {
      const input = { idempotencyKey: "receipt", mode, operation: "publish" };
      const request = new Request("https://example.com/api/ai", {
        body: JSON.stringify(input),
        method: "POST",
      });
      await expect(readAiRequest(request)).resolves.toStrictEqual(input);
    }
  );

  test("fails closed when configuration or the dedicated bearer token is missing", () => {
    const request = new Request("https://example.com/api/ai");
    expect(authorizeAiRequest({ request })?.status).toBe(503);
    expect(authorizeAiRequest({ request, secret: "private-key" })?.status).toBe(
      401
    );
  });

  test("does not accept a cookie or a raw token as bearer authentication", () => {
    const request = new Request("https://example.com/api/ai", {
      headers: { authorization: "private-key", cookie: "session=admin" },
    });
    expect(authorizeAiRequest({ request, secret: "private-key" })?.status).toBe(
      401
    );
    request.headers.set("authorization", "Bearer private-key");
    expect(
      authorizeAiRequest({ request, secret: "private-key" })
    ).toBeUndefined();
  });

  test("requires finite timestamps and an explicit version for urgent messages", async () => {
    const request = new Request("https://example.com/api/ai", {
      body: JSON.stringify({
        code: "A1",
        idempotencyKey: "incident",
        operation: "notify",
      }),
      method: "POST",
    });
    await expect(readAiRequest(request)).rejects.toThrow("expectedVersion");
  });

  test("rejects oversized requests even without a content-length header", async () => {
    const request = new Request("https://example.com/api/ai", {
      body: "x".repeat(128_001),
      method: "POST",
    });
    await expect(readAiRequest(request)).rejects.toThrow("Request too large");
  });

  test("requires a reply id and current version before applying an interpreted decision", async () => {
    const input = {
      action: "snooze",
      code: "A7",
      expectedVersion: 3,
      operation: "reply-decision",
      replyId: "reply-id",
      snoozeUntil: Date.now() + 86_400_000,
    };
    const request = new Request("https://example.com/api/ai", {
      body: JSON.stringify(input),
      method: "POST",
    });
    await expect(readAiRequest(request)).resolves.toStrictEqual(input);
    const unversioned = new Request("https://example.com/api/ai", {
      body: JSON.stringify({ ...input, expectedVersion: null }),
      method: "POST",
    });
    await expect(readAiRequest(unversioned)).rejects.toThrow("expectedVersion");
  });

  test("requires a recorded outcome when acknowledging a processed reply", async () => {
    const request = new Request("https://example.com/api/ai", {
      body: JSON.stringify({
        operation: "acknowledge-reply",
        replyId: "reply-id",
        result: "   ",
      }),
      method: "POST",
    });
    await expect(readAiRequest(request)).rejects.toThrow("result");
  });
});
