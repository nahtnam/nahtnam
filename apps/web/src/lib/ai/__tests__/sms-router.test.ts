import { describe, expect, test, vi } from "vitest";

import { routeIncomingText } from "../sms-router";

describe("SMS command routing", () => {
  test.each([
    "A7 DONE",
    "A7 Y",
    "Y",
    "A7 UNKNOWN",
    "UNDO A7",
    "NOT MINE A7",
    "not   mine A7",
    "A7 UNDO",
  ])("never prints a rejected command: %s", async (body) => {
    const print = vi
      .fn<() => Promise<{ status: string }>>()
      .mockResolvedValue({ status: "queued" });
    const command = vi
      .fn<() => Promise<{ handled: boolean }>>()
      .mockResolvedValue({ handled: false });
    await routeIncomingText({ body, command, print });
    expect(command).toHaveBeenCalledOnce();
    expect(print).not.toHaveBeenCalled();
  });

  test("confirms a decision without creating a receipt", async () => {
    const print = vi.fn<() => Promise<{ status: string }>>();
    const result = await routeIncomingText({
      body: "A7 DONE",
      command: () =>
        Promise.resolve({ handled: true, reply: "A7 marked done." }),
      print,
    });
    expect(result.message).toBe("A7 marked done.");
    expect(print).not.toHaveBeenCalled();
  });

  test("preserves ordinary public text-to-printer messages and reports queue acceptance", async () => {
    const command = vi.fn<() => Promise<{ handled: boolean }>>();
    const print = vi
      .fn<() => Promise<{ status: string }>>()
      .mockResolvedValue({ status: "queued" });
    const result = await routeIncomingText({
      body: "Hello from a friend",
      command,
      print,
    });
    expect(command).not.toHaveBeenCalled();
    expect(print).toHaveBeenCalledOnce();
    expect(result.message).toBe("QUEUED");
  });
});
