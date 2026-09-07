import { describe, expect, test, vi } from "vitest";

import { handlePrintRequest } from "../server";
import type { PrintApiClient } from "../server";

function client() {
  return {
    cancel: vi
      .fn<PrintApiClient["cancel"]>()
      .mockResolvedValue({ id: "job1", status: "cancelled" }),
    create: vi
      .fn<PrintApiClient["create"]>()
      .mockResolvedValue({ id: "job1", status: "queued" }),
    getStatus: vi.fn<PrintApiClient["getStatus"]>().mockResolvedValue({
      availableAt: 0,
      id: "job1",
      printState: { attempts: 0 },
      status: "queued",
    }),
    retry: vi
      .fn<PrintApiClient["retry"]>()
      .mockResolvedValue({ id: "job1", status: "queued" }),
  };
}

function request(
  method: string,
  body?: unknown,
  token: string | null = "test-secret"
) {
  return new Request("https://www.nahtnam.com/api/print?jobId=job1", {
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: token
      ? { authorization: `Bearer ${token}`, "content-type": "application/json" }
      : {},
    method,
  });
}

describe("print HTTP controls", () => {
  test("status is private and cannot be cached", async () => {
    const response = await handlePrintRequest(request("GET"), client());
    expect(response.headers.get("Cache-Control")).toBe("no-store, private");
  });

  test("general print requests cannot attach private action receipt state", async () => {
    const backend = client();
    const response = await handlePrintRequest(
      request("POST", {
        aiReceiptId: "private-receipt",
        payload: { _type: "message", body: "An ordinary note" },
      }),
      backend
    );
    expect(response.status).toBe(200);
    expect(backend.create).toHaveBeenCalledWith({
      payload: { _type: "message", body: "An ordinary note" },
      secret: "test-secret",
      source: "api",
    });
  });
  test.each(["GET", "POST", "PATCH"])(
    "requires a bearer secret for %s",
    async (method) => {
      const backend = client();
      const response = await handlePrintRequest(
        request(method, undefined, null),
        backend
      );
      expect(response.status).toBe(401);
      expect(backend.getStatus).not.toHaveBeenCalled();
      expect(backend.create).not.toHaveBeenCalled();
      expect(backend.cancel).not.toHaveBeenCalled();
    }
  );

  test("preserves create and forwards optional expiry/QR fields", async () => {
    const backend = client();
    const response = await handlePrintRequest(
      request("POST", {
        expiresAt: 12_345,
        idempotencyKey: "stable-key",
        payload: {
          _type: "message",
          actionPath: "/ai/r/receipt1",
          body: "One task",
        },
      }),
      backend
    );
    expect(response.status).toBe(200);
    expect(backend.create).toHaveBeenCalledWith({
      expiresAt: 12_345,
      idempotencyKey: "stable-key",
      payload: {
        _type: "message",
        actionPath: "/ai/r/receipt1",
        body: "One task",
      },
      secret: "test-secret",
      source: "api",
    });
  });

  test("rejects external QR targets before calling Convex", async () => {
    const backend = client();
    const response = await handlePrintRequest(
      request("POST", {
        payload: {
          _type: "message",
          actionPath: "https://evil.example/ai",
          body: "Bad",
        },
      }),
      backend
    );
    expect(response.status).toBe(400);
    expect(backend.create).not.toHaveBeenCalled();
  });

  test("maps rejected backend credentials to 401", async () => {
    const backend = client();
    backend.getStatus.mockRejectedValue(new Error("Unauthorized"));
    const response = await handlePrintRequest(
      request("GET", undefined, "wrong"),
      backend
    );
    expect(response.status).toBe(401);
  });

  test.each(["cancel", "retry"] as const)(
    "executes %s against the existing job",
    async (operation) => {
      const backend = client();
      const response = await handlePrintRequest(
        request("PATCH", { jobId: "job1", operation }),
        backend
      );
      expect(response.status).toBe(200);
      expect(backend[operation]).toHaveBeenCalledWith({
        jobId: "job1",
        secret: "test-secret",
      });
      expect(backend.create).not.toHaveBeenCalled();
    }
  );

  test("reports an active claim conflict without pretending cancellation succeeded", async () => {
    const backend = client();
    backend.cancel.mockRejectedValue(
      new Error('ConvexError {"code":"INVALID_STATE"}')
    );
    const response = await handlePrintRequest(
      request("PATCH", { jobId: "job1", operation: "cancel" }),
      backend
    );
    expect(response.status).toBe(409);
  });
});
