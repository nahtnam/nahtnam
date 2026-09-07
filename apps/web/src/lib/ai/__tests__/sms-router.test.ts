import { describe, expect, test, vi } from "vitest";

import { routeIncomingText } from "../sms-router";

describe("SMS reply routing", () => {
  test.each([
    "A7 DONE",
    "A7 Y",
    "Y",
    "A7 UNKNOWN",
    "UNDO A7",
    "NOT MINE A7",
    "not   mine A7",
    "A7 UNDO",
  ])("never prints a non-owner command-like message: %s", async (body) => {
    const print = vi
      .fn<() => Promise<{ status: string }>>()
      .mockResolvedValue({ status: "queued" });
    const receive = vi
      .fn<() => Promise<{ handled: boolean }>>()
      .mockResolvedValue({ handled: false });
    await routeIncomingText({ body, print, receive });
    expect(receive).toHaveBeenCalledOnce();
    expect(print).not.toHaveBeenCalled();
  });

  test.each([
    "A7 DONE",
    "Y",
    "Actually, that refund arrived yesterday. Please stop reminding me.",
    "  A7: later, please\r\n\r\n\r\nkeep this wording  ",
  ])(
    "stores owner replies without interpreting or printing them: %s",
    async (body) => {
      const print = vi.fn<() => Promise<{ status: string }>>();
      const receive = vi
        .fn<() => Promise<{ handled: boolean; reply?: string }>>()
        .mockResolvedValue({
          handled: true,
          reply: "Saved. Your automation will read this on its next run.",
        });
      const result = await routeIncomingText({ body, print, receive });
      expect(receive).toHaveBeenCalledOnce();
      expect(result.message).toBe(
        "Saved. Your automation will read this on its next run."
      );
      expect(print).not.toHaveBeenCalled();
    }
  );

  test("preserves ordinary public text-to-printer messages after verifying a non-owner", async () => {
    const receive = vi
      .fn<() => Promise<{ handled: boolean; reply?: string }>>()
      .mockResolvedValue({ handled: false });
    const print = vi
      .fn<() => Promise<{ status: string }>>()
      .mockResolvedValue({ status: "queued" });
    const result = await routeIncomingText({
      body: "Hello from a friend",
      print,
      receive,
    });
    expect(receive).toHaveBeenCalledOnce();
    expect(print).toHaveBeenCalledOnce();
    expect(result.message).toBe("QUEUED");
  });

  test("never falls through to paper when sender classification fails", async () => {
    const print = vi.fn<() => Promise<{ status: string }>>();
    const receive = vi
      .fn<() => Promise<{ handled: boolean; reply?: string }>>()
      .mockRejectedValue(new Error("Unavailable"));
    await expect(
      routeIncomingText({ body: "This is a private reply", print, receive })
    ).rejects.toThrow("Unavailable");
    expect(print).not.toHaveBeenCalled();
  });

  test("stays private when automation access is not configured", async () => {
    const print = vi.fn<() => Promise<{ status: string }>>();
    const receive = vi
      .fn<() => Promise<{ handled: boolean; reply?: string }>>()
      .mockResolvedValue({ handled: true });
    const result = await routeIncomingText({
      body: "This is a private reply",
      print,
      receive,
    });
    expect(result.message).toBeUndefined();
    expect(print).not.toHaveBeenCalled();
  });
});
