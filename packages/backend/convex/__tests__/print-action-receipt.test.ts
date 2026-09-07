/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { printJobFunctions } from "../../src/print";
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

const initialTime = new Date("2026-09-07T15:00:00Z").getTime();
const ownerTokenIdentifier = "https://example.test|owner";
const secret = "receipt-test-secret";
const workerId = "receipt-test-worker";

async function queuedActionReceipt() {
  const t = convexTest(schema, modules);
  const owner = t.withIdentity({
    issuer: "https://example.test",
    role: "admin",
    subject: "owner",
    tokenIdentifier: ownerTokenIdentifier,
  });
  const ids = await t.run(async (ctx) => {
    await ctx.db.insert("aiSettings", {
      nextCode: 2,
      ownerTokenIdentifier,
      paperEnabled: true,
      pausedSources: [],
      singleton: "primary",
    });
    const itemId = await ctx.db.insert("aiItems", {
      appearances: 0,
      checkedAt: initialTime,
      code: "A1",
      evidenceAt: initialTime - 1000,
      kind: "task",
      nextNotifyAt: initialTime,
      ownerTokenIdentifier,
      ownership: "confirmed",
      priority: "routine",
      source: "money-recovery",
      sourceKey: "refund-1",
      status: "open",
      title: "Check the refund",
      usefulUntil: initialTime + 6 * 3_600_000,
      version: 1,
      whyNow: "The promised posting window ended",
    });
    const receiptId = await ctx.db.insert("aiReceipts", {
      createdAt: initialTime,
      expiresAt: initialTime + 4 * 3_600_000,
      idempotencyKey: "morning:2026-09-07",
      items: [
        {
          code: "A1",
          itemId,
          title: "Check the refund",
          version: 1,
          whyNow: "The promised posting window ended",
        },
      ],
      ownerTokenIdentifier,
      title: "Today",
    });
    const jobId = await ctx.db.insert("printJobs", {
      aiReceiptId: receiptId,
      availableAt: initialTime,
      expiresAt: initialTime + 4 * 3_600_000,
      idempotencyKey: `ai-receipt:${receiptId}`,
      payload: {
        _type: "message",
        actionPath: `/ai/r/${receiptId}`,
        body: "A1 Check the refund",
      },
      printState: { attempts: 0 },
      source: "ai-action-center",
      status: "queued",
    });
    await ctx.db.patch("aiReceipts", receiptId, { printJobId: jobId });
    await ctx.db.patch("aiItems", itemId, { pendingReceiptId: receiptId });
    return { itemId, jobId, receiptId };
  });
  return { ...ids, owner, t };
}

function claim() {
  return { now: Date.now(), secret, workerId };
}

describe("queued action receipt revalidation", () => {
  beforeEach(() => {
    vi.stubEnv("PRINT_SECRET", secret);
    vi.useFakeTimers();
    vi.setSystemTime(initialTime);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  test.each(["done", "ignore", "snooze"] as const)(
    "does not print a task marked %s while the printer was offline",
    async (action) => {
      const { t, owner, jobId, itemId } = await queuedActionReceipt();
      await owner.mutation(api.ai.respond, {
        action,
        code: "A1",
        expectedVersion: 1,
        ...(action === "snooze"
          ? { snoozeUntil: initialTime + 86_400_000 }
          : {}),
      });
      vi.setSystemTime(initialTime + 3_600_000);
      await expect(
        t.mutation(printJobFunctions.claimNext, claim())
      ).resolves.toBeNull();
      await expect(
        t.query(printJobFunctions.getStatus, { jobId, secret })
      ).resolves.toMatchObject({
        printState: {
          attempts: 0,
          lastError:
            "Receipt cancelled: an action was completed, dismissed or snoozed",
        },
        status: "cancelled",
      });
      const item = await t.run((ctx) => ctx.db.get("aiItems", itemId));
      expect(item?.appearances).toBe(0);
      expect(item?.pendingReceiptId).toBeUndefined();
    }
  );

  test.each(["paper", "source"])(
    "honors %s pause changes before dispatch",
    async (pause) => {
      const { t, owner, jobId } = await queuedActionReceipt();
      await owner.mutation(
        api.ai.configure,
        pause === "paper"
          ? { paperEnabled: false }
          : { pausedSources: ["money-recovery"] }
      );
      await expect(
        t.mutation(printJobFunctions.claimNext, claim())
      ).resolves.toBeNull();
      await expect(
        t.query(printJobFunctions.getStatus, { jobId, secret })
      ).resolves.toMatchObject({
        printState: {
          attempts: 0,
          lastError: expect.stringContaining("paused"),
        },
        status: "cancelled",
      });
    }
  );

  test("cancels an outdated version rather than printing changed instructions", async () => {
    const { t, jobId, itemId } = await queuedActionReceipt();
    await t.run((ctx) =>
      ctx.db.patch("aiItems", itemId, {
        code: "A2",
        title: "Refund arrived; investigate a different charge",
        version: 2,
      })
    );
    await expect(
      t.mutation(printJobFunctions.claimNext, claim())
    ).resolves.toBeNull();
    await expect(
      t.query(printJobFunctions.getStatus, { jobId, secret })
    ).resolves.toMatchObject({
      printState: {
        lastError:
          "Receipt cancelled: an action changed after the receipt was prepared",
      },
      status: "cancelled",
    });
  });

  test("does not dispatch an item whose reservation moved to another receipt", async () => {
    const { t, jobId, itemId } = await queuedActionReceipt();
    const replacement = await t.run(async (ctx) => {
      const id = await ctx.db.insert("aiReceipts", {
        createdAt: Date.now(),
        expiresAt: initialTime + 4 * 3_600_000,
        idempotencyKey: "replacement",
        items: [
          {
            code: "A1",
            itemId,
            title: "Current receipt",
            version: 1,
            whyNow: "Current context",
          },
        ],
        ownerTokenIdentifier,
        title: "Current",
      });
      await ctx.db.patch("aiItems", itemId, { pendingReceiptId: id });
      return id;
    });
    await expect(
      t.mutation(printJobFunctions.claimNext, claim())
    ).resolves.toBeNull();
    await expect(
      t.query(printJobFunctions.getStatus, { jobId, secret })
    ).resolves.toMatchObject({ status: "cancelled" });
    await expect(
      t.run((ctx) => ctx.db.get("aiItems", itemId))
    ).resolves.toMatchObject({ pendingReceiptId: replacement });
  });

  test("general printer callers cannot attach an action receipt", async () => {
    const { t, receiptId } = await queuedActionReceipt();
    const request = {
      aiReceiptId: receiptId,
      payload: { _type: "message" as const, body: "Unrelated print" },
      secret,
      source: "general-api",
    };
    await expect(t.mutation(printJobFunctions.create, request)).rejects.toThrow(
      /aiReceiptId/u
    );
  });

  test("a dispatched receipt consumes one appearance and releases its reservation", async () => {
    const { t, jobId, itemId } = await queuedActionReceipt();
    await expect(
      t.mutation(printJobFunctions.claimNext, claim())
    ).resolves.toMatchObject({ _id: jobId });
    await t.mutation(printJobFunctions.markPrinted, {
      jobId,
      secret,
      workerId,
    });
    const item = await t.run((ctx) => ctx.db.get("aiItems", itemId));
    expect(item?.appearances).toBe(1);
    expect(item?.pendingReceiptId).toBeUndefined();
    await expect(
      t.mutation(printJobFunctions.markPrinted, { jobId, secret, workerId })
    ).rejects.toThrow("Job is not claimed");
  });

  test("expiry after downtime releases a reservation without using an appearance", async () => {
    const { t, jobId, itemId } = await queuedActionReceipt();
    vi.setSystemTime(initialTime + 4 * 3_600_000);
    await expect(
      t.mutation(printJobFunctions.claimNext, claim())
    ).resolves.toBeNull();
    await expect(
      t.query(printJobFunctions.getStatus, { jobId, secret })
    ).resolves.toMatchObject({ status: "expired" });
    const item = await t.run((ctx) => ctx.db.get("aiItems", itemId));
    expect(item?.appearances).toBe(0);
    expect(item?.pendingReceiptId).toBeUndefined();
  });

  test("final failure releases the reservation and retry safely reserves the same job", async () => {
    const { t, jobId, itemId, receiptId } = await queuedActionReceipt();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      // oxlint-disable-next-line no-await-in-loop -- Printer attempts are sequential.
      await t.mutation(printJobFunctions.claimNext, claim());
      // oxlint-disable-next-line no-await-in-loop -- Failure precedes the next attempt.
      await t.mutation(printJobFunctions.markFailed, {
        error: "Printer offline",
        jobId,
        secret,
        workerId,
      });
      vi.setSystemTime(Date.now() + 30_000);
    }
    await expect(
      t.run((ctx) => ctx.db.get("aiItems", itemId))
    ).resolves.toMatchObject({ appearances: 0 });
    const failedItem = await t.run((ctx) => ctx.db.get("aiItems", itemId));
    expect(failedItem?.pendingReceiptId).toBeUndefined();
    await expect(
      t.mutation(printJobFunctions.retry, { jobId, secret })
    ).resolves.toStrictEqual({ id: jobId, status: "queued" });
    await expect(
      t.run((ctx) => ctx.db.get("aiItems", itemId))
    ).resolves.toMatchObject({ pendingReceiptId: receiptId });
    await expect(
      t.mutation(printJobFunctions.claimNext, claim())
    ).resolves.toMatchObject({ _id: jobId });
  });
});
