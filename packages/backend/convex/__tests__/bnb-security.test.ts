/// <reference types="vite/client" />
/* oxlint-disable sonarjs/no-hardcoded-passwords -- These are isolated authentication test fixtures. */

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { describe, expect, test, vi } from "vitest";

import type { Doc } from "../_generated/dataModel";
import { BNB_SESSION_TTL_MS } from "../bnb/auth";
import schema from "../schema";

const modules = import.meta.glob(["../**/*.*s", "!../__tests__/**/*.*s"]);

// fluent-convex 0.13 ships extensionless ESM imports in dist. Loading its
// TypeScript source lets Vite resolve those imports inside the test runtime.
vi.mock(import("fluent-convex"), () => {
  const packageSource = [
    "../../node_modules/fluent-convex/src",
    "index.ts",
  ].join("/");
  return import(packageSource);
});

vi.mock(import("../lib/telegram"), () => ({
  escapeTelegramHtml: (value: string) => value,
  sendTelegramMessage: vi.fn<() => Promise<void>>(() => Promise.resolve()),
}));

process.env.BNB_PASSWORD = "bnb-secret";

const verifyPassword = makeFunctionReference<
  "action",
  { password: string },
  { expiresAt: number; sessionToken: string; success: true }
>("bnb/actions:verifyPassword");
const listBookings = makeFunctionReference<
  "action",
  { sessionToken: string },
  { accepted: Doc<"bnbBookings">[]; pending: Doc<"bnbBookings">[] }
>("bnb/queries:listBookings");
const requestBooking = makeFunctionReference<
  "action",
  {
    checkIn: string;
    checkOut: string;
    guests: string[];
    notes?: string;
    sessionToken: string;
  },
  { success: true }
>("bnb/actions:requestBooking");

async function actionErrorCode(action: Promise<unknown>) {
  try {
    await action;
    return "resolved";
  } catch (error) {
    if (typeof error !== "object" || error === null || !("data" in error)) {
      return "unknown";
    }

    const { data } = error;
    if (typeof data !== "object" || data === null || !("code" in data)) {
      return "unknown";
    }

    return typeof data.code === "string" ? data.code : "unknown";
  }
}

describe("BnB capability security", () => {
  test("allows five wrong guesses, then returns a durable rate-limit error", async () => {
    const t = convexTest(schema, modules);

    const outcomes = [
      await actionErrorCode(t.action(verifyPassword, { password: "wrong-0" })),
      await actionErrorCode(t.action(verifyPassword, { password: "wrong-1" })),
      await actionErrorCode(t.action(verifyPassword, { password: "wrong-2" })),
      await actionErrorCode(t.action(verifyPassword, { password: "wrong-3" })),
      await actionErrorCode(t.action(verifyPassword, { password: "wrong-4" })),
      await actionErrorCode(
        t.action(verifyPassword, { password: "wrong-final" })
      ),
      await actionErrorCode(
        t.action(verifyPassword, { password: "bnb-secret" })
      ),
    ];

    expect(outcomes).toStrictEqual([
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "RATE_LIMITED",
      "RATE_LIMITED",
    ]);
  });

  test("serializes concurrent guesses against the same budget", async () => {
    const t = convexTest(schema, modules);
    const outcomes = await Promise.all(
      Array.from({ length: 8 }, (_, attempt) =>
        actionErrorCode(
          t.action(verifyPassword, { password: `parallel-${attempt}` })
        )
      )
    );

    expect(outcomes.toSorted()).toStrictEqual([
      "RATE_LIMITED",
      "RATE_LIMITED",
      "RATE_LIMITED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "UNAUTHORIZED",
    ]);
  });

  test("mints a 256-bit capability while storing only its hash", async () => {
    const t = convexTest(schema, modules);
    const session = await t.action(verifyPassword, { password: "bnb-secret" });
    const storedSessions = await t.run((ctx) =>
      ctx.db.query("bnbSessions").withIndex("by_tokenHash").take(10)
    );

    expect(session).toMatchObject({
      expiresAt: expect.any(Number),
      sessionToken: expect.stringMatching(/^[\da-f]{64}$/u),
      success: true,
    });
    expect(session.expiresAt).toBeGreaterThan(Date.now());
    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0]?.tokenHash).toMatch(/^[\da-f]{64}$/u);
    expect({
      hasRawTokenField:
        storedSessions[0] !== undefined && "sessionToken" in storedSessions[0],
      storedRawToken: storedSessions[0]?.tokenHash === session.sessionToken,
    }).toStrictEqual({
      hasRawTokenField: false,
      storedRawToken: false,
    });
  });

  test("only the minted capability can list bookings", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("bnbBookings", {
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guests: ["Ada"],
        status: "accepted",
      })
    );

    const session = await t.action(verifyPassword, { password: "bnb-secret" });

    await expect(
      t.action(listBookings, { sessionToken: "0".repeat(64) })
    ).rejects.toMatchObject({ data: { code: "UNAUTHORIZED" } });

    await expect(
      t.action(listBookings, { sessionToken: session.sessionToken })
    ).resolves.toMatchObject({ accepted: [{ guests: ["Ada"] }] });
  });

  test("does not accept an expired capability", async () => {
    const now = Date.now();
    vi.useFakeTimers({ now });
    try {
      const t = convexTest(schema, modules);
      const session = await t.action(verifyPassword, {
        password: "bnb-secret",
      });

      vi.advanceTimersByTime(BNB_SESSION_TTL_MS + 1);
      await expect(
        t.action(listBookings, { sessionToken: session.sessionToken })
      ).rejects.toMatchObject({ data: { code: "UNAUTHORIZED" } });
    } finally {
      vi.useRealTimers();
    }
  });

  test("requires a capability when requesting a booking", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.action(requestBooking, {
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guests: ["Ada"],
        password: "bnb-secret",
        sessionToken: "f".repeat(64),
      } as never)
    ).rejects.toThrow("Unexpected field `password`");

    await expect(
      t.action(requestBooking, {
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guests: ["Ada"],
        sessionToken: "f".repeat(64),
      })
    ).rejects.toMatchObject({ data: { code: "UNAUTHORIZED" } });

    const session = await t.action(verifyPassword, { password: "bnb-secret" });
    await expect(
      t.action(requestBooking, {
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guests: ["Ada"],
        sessionToken: session.sessionToken,
      })
    ).resolves.toStrictEqual({ success: true });

    await expect(
      t.run((ctx) => ctx.db.query("bnbBookings").take(10))
    ).resolves.toMatchObject([{ guests: ["Ada"], status: "pending" }]);
  });
});
