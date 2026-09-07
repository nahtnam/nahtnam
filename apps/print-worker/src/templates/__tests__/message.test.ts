import type { ClaimedPrintJob } from "@repo/backend/print";
import { appUrl } from "@repo/config/app";
import { deserialize } from "react-thermal-printer";
import { describe, expect, test } from "vitest";

import { renderPrintJob } from "..";
import { assertPrintWindow } from "../../expiry";

const job: ClaimedPrintJob = {
  _creationTime: 1_788_793_200_000,
  _id: "internal-print-id",
  availableAt: 1_788_793_200_000,
  payload: {
    _type: "message",
    actionPath: "/ai/r/receipt1",
    body: "1. Confirm the refund",
    title: "TODAY",
  },
  printState: { attempts: 1 },
  source: "internal-automation-source",
  status: "printing",
};

describe("Epson action receipts", () => {
  test("encodes a canonical local-app QR and human controls without printing internal IDs", async () => {
    const bytes = await renderPrintJob(job);
    const commands = deserialize(bytes);
    expect(commands.map((command) => command.name)).toStrictEqual(
      expect.arrayContaining(["qrcodeStore", "qrcodePrint"])
    );
    expect(new TextDecoder().decode(bytes)).toContain(
      `${appUrl}/ai/r/receipt1`
    );
    const text = commands
      .map((command) =>
        command.name === "char" ? String.fromCodePoint(command.data) : ""
      )
      .join("");
    expect(text).toContain("Scan to review or update");
    expect(text).toContain("Done / Snooze / Dismiss");
    expect(text).not.toMatch(/internal-print-id|internal-automation-source/u);
  });

  test("preserves ordinary inbound text printing without adding action controls", async () => {
    const bytes = await renderPrintJob({
      ...job,
      payload: {
        _type: "text-message",
        body: "Hi from a visitor",
        from: "+15555550123",
      },
    });
    const commands = deserialize(bytes);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("TEXT FROM");
    expect(text).toContain("Hi from a visitor");
    expect(
      commands.some((command) => command.name === "qrcodePrint")
    ).toBeFalsy();
  });

  test("refuses unsafe persisted QR targets before generating printer bytes", () => {
    expect(() =>
      renderPrintJob({
        ...job,
        payload: {
          _type: "message",
          actionPath: "//evil.example/ai",
          body: "Bad",
        },
      })
    ).toThrow("Action path must stay within /ai");
  });

  test("guards useful-by at dispatch, including the exact deadline", () => {
    expect(() => assertPrintWindow(100, 100)).toThrow("Receipt expired");
    expect(() => assertPrintWindow(100, 101)).toThrow("Receipt expired");
    expect(() => assertPrintWindow(101, 100)).not.toThrow();
    expect(() => assertPrintWindow(undefined, 100)).not.toThrow();
  });
});
