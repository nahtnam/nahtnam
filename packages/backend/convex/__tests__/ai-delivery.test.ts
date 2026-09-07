/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob(["../**/*.*s", "!../__tests__/**/*.*s"]);
vi.mock(import("fluent-convex"), () => {
  const packageSource = [
    "../../node_modules/fluent-convex/src",
    "index.ts",
  ].join("/");
  return import(packageSource);
});
const now = 1_788_804_000_000;
const secret = "ai-test-secret";
const sendArgs = {
  code: "A1",
  expectedVersion: 1,
  idempotencyKey: "urgent-one",
  secret,
};

async function setup() {
  const t = convexTest(schema, modules);
  const itemId = await t.run(async (ctx) => {
    await ctx.db.insert("aiSettings", {
      nextCode: 2,
      ownerTokenIdentifier: "owner",
      paperEnabled: true,
      pausedSources: [],
      phone: "+15555550123",
      singleton: "primary",
    });
    return await ctx.db.insert("aiItems", {
      appearances: 0,
      checkedAt: now,
      code: "A1",
      evidenceAt: now,
      kind: "task",
      nextNotifyAt: now,
      ownerTokenIdentifier: "owner",
      ownership: "confirmed",
      priority: "urgent",
      source: "health",
      sourceKey: "printer",
      status: "open",
      title: "Restore printer access",
      urgentMilestone: "first-failure",
      usefulUntil: now + 60_000,
      version: 1,
      whyNow: "A time-sensitive reminder could not print.",
    });
  });
  return { itemId, t };
}

describe("urgent SMS delivery", () => {
  beforeEach(() => {
    vi.stubEnv("AI_AUTOMATION_SECRET", secret);
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  test("rejects an invalid machine token before returning personal data", async () => {
    const { t } = await setup();
    await expect(
      t.mutation(api["ai_delivery"].reserve, { ...sendArgs, secret: "wrong" })
    ).rejects.toThrow("Unauthorized");
  });

  test("deduplicates the incident milestone even after a new wording/version", async () => {
    const { t, itemId } = await setup();
    const first = await t.mutation(api["ai_delivery"].reserve, sendArgs);
    await t.run((ctx) =>
      ctx.db.patch("aiItems", itemId, {
        title: "Printer still needs access",
        version: 2,
      })
    );
    const duplicate = await t.mutation(api["ai_delivery"].reserve, {
      ...sendArgs,
      expectedVersion: 2,
      idempotencyKey: "other-key",
    });
    expect(first).toMatchObject({ phone: "+15555550123", send: true });
    expect(duplicate).toMatchObject({ id: first.id, send: false });
  });

  test("does not resend an uncertain provider request", async () => {
    const { t } = await setup();
    const first = await t.mutation(api["ai_delivery"].reserve, sendArgs);
    await t.mutation(api["ai_delivery"].settle, {
      id: first.id,
      secret,
      status: "unknown",
    });
    const retry = await t.mutation(api["ai_delivery"].reserve, sendArgs);
    expect(retry).toMatchObject({
      id: first.id,
      send: false,
      status: "unknown",
    });
  });

  test("permits urgent paper-delivery fallback but rejects snoozed and expired items", async () => {
    const { t, itemId } = await setup();
    await t.run((ctx) =>
      ctx.db.patch("aiItems", itemId, {
        lastNotifiedAt: now,
        lastNotifiedMilestone: "first-failure",
        nextNotifyAt: now + 86_400_000,
      })
    );
    const fallback = await t.mutation(api["ai_delivery"].reserve, sendArgs);
    expect(fallback.send).toBeTruthy();
    await t.run((ctx) =>
      ctx.db.patch("aiItems", itemId, { status: "snoozed" })
    );
    await expect(
      t.mutation(api["ai_delivery"].reserve, {
        ...sendArgs,
        idempotencyKey: "new",
      })
    ).rejects.toThrow("Only a current");
    await t.run((ctx) =>
      ctx.db.patch("aiItems", itemId, { status: "open", usefulUntil: now - 1 })
    );
    await expect(
      t.mutation(api["ai_delivery"].reserve, {
        ...sendArgs,
        idempotencyKey: "new",
      })
    ).rejects.toThrow("Only a current");
  });

  test("rejects mismatched provider callbacks and never downgrades delivered", async () => {
    const { t } = await setup();
    const delivery = await t.mutation(api["ai_delivery"].reserve, sendArgs);
    await t.mutation(api["ai_delivery"].settle, {
      id: delivery.id,
      providerId: "SM-one",
      secret,
      status: "sent",
    });
    await expect(
      t.mutation(api["ai_delivery"].recordStatus, {
        id: delivery.id,
        providerId: "SM-other",
        secret,
        status: "delivered",
      })
    ).rejects.toThrow("does not match");
    await t.mutation(api["ai_delivery"].recordStatus, {
      id: delivery.id,
      providerId: "SM-one",
      secret,
      status: "delivered",
    });
    const lateFailure = await t.mutation(api["ai_delivery"].recordStatus, {
      id: delivery.id,
      providerId: "SM-one",
      secret,
      status: "failed",
    });
    expect(lateFailure.status).toBe("delivered");
  });

  test("does not text an urgent question the owner already answered on paper", async () => {
    const { t, itemId } = await setup();
    await t.run((ctx) =>
      ctx.db.patch("aiItems", itemId, {
        decision: "no",
        lastNotifiedAt: now,
        lastNotifiedMilestone: "first-failure",
        nextNotifyAt: now + 86_400_000,
        userResolutionAt: now,
      })
    );
    await expect(
      t.mutation(api["ai_delivery"].reserve, sendArgs)
    ).rejects.toThrow("Only a current");
  });
});
