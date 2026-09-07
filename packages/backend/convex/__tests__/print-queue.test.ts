/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { printJobFunctions } from "../../src/print";
import schema from "../schema";

const modules = import.meta.glob(["../**/*.*s", "!../__tests__/**/*.*s"]);
vi.mock(import("fluent-convex"), () => {
  const packageSource = [
    "../../node_modules/fluent-convex/src",
    "index.ts",
  ].join("/");
  return import(packageSource);
});

const secret = "test-print-secret";
const workerId = "test-worker";
const initialTime = new Date("2026-09-07T15:00:00Z").getTime();
const input = {
  idempotencyKey: "morning:2026-09-07",
  payload: {
    _type: "message" as const,
    actionPath: "/ai/r/receipt1",
    body: "One useful task",
  },
  secret,
  source: "daily-actions",
};

describe("receipt printing", () => {
  beforeEach(() => {
    vi.stubEnv("PRINT_SECRET", secret);
    vi.useFakeTimers();
    vi.setSystemTime(initialTime);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe("receipt queue lifecycle", () => {
    test("expires old receipts when a host reconnects, even with its stale timestamp", async () => {
      const t = convexTest(schema, modules);
      const stale = await t.mutation(printJobFunctions.create, {
        ...input,
        expiresAt: initialTime + 60_000,
      });
      const timeless = await t.mutation(printJobFunctions.create, {
        ...input,
        idempotencyKey: "legacy",
        payload: { _type: "message", body: "Legacy receipt" },
      });
      vi.setSystemTime(initialTime + 2 * 60_000);
      const claimed = await t.mutation(printJobFunctions.claimNext, {
        now: initialTime,
        secret,
        workerId,
      });
      expect(claimed?._id).toBe(timeless.id);
      await expect(
        t.query(printJobFunctions.getStatus, { jobId: stale.id, secret })
      ).resolves.toMatchObject({
        printState: { attempts: 0 },
        status: "expired",
      });
    });

    test("wakes at useful-by time even when availability is later", async () => {
      const t = convexTest(schema, modules);
      const job = await t.mutation(printJobFunctions.create, {
        ...input,
        availableAt: initialTime + 120_000,
        expiresAt: initialTime + 60_000,
      });
      await expect(
        t.query(printJobFunctions.watchQueue, { now: initialTime, secret })
      ).resolves.toMatchObject({ nextWakeAt: initialTime + 60_000 });
      vi.setSystemTime(initialTime + 60_000);
      await expect(
        t.mutation(printJobFunctions.claimNext, {
          now: Date.now(),
          secret,
          workerId,
        })
      ).resolves.toBeNull();
      await expect(
        t.query(printJobFunctions.getStatus, { jobId: job.id, secret })
      ).resolves.toMatchObject({ status: "expired" });
    });

    test("cancellation prevents dispatch and a duplicate create cannot resurrect it", async () => {
      const t = convexTest(schema, modules);
      const job = await t.mutation(printJobFunctions.create, input);
      await expect(
        t.mutation(printJobFunctions.cancel, { jobId: job.id, secret })
      ).resolves.toStrictEqual({ id: job.id, status: "cancelled" });
      await expect(
        t.mutation(printJobFunctions.create, input)
      ).resolves.toStrictEqual({
        id: job.id,
        status: "cancelled",
      });
      await expect(
        t.mutation(printJobFunctions.claimNext, {
          now: Date.now(),
          secret,
          workerId,
        })
      ).resolves.toBeNull();
      await expect(
        t.mutation(printJobFunctions.retry, { jobId: job.id, secret })
      ).rejects.toThrow("Only failed jobs");
    });

    test("retries a failed job in place with its original idempotency key", async () => {
      const t = convexTest(schema, modules);
      const job = await t.mutation(printJobFunctions.create, input);
      for (let attempt = 0; attempt < 3; attempt += 1) {
        // A printer processes attempts serially; retries are intentionally delayed.
        // oxlint-disable-next-line no-await-in-loop
        await t.mutation(printJobFunctions.claimNext, {
          now: Date.now(),
          secret,
          workerId,
        });
        // oxlint-disable-next-line no-await-in-loop
        await t.mutation(printJobFunctions.markFailed, {
          error: "Printer offline",
          jobId: job.id,
          secret,
          workerId,
        });
        vi.setSystemTime(Date.now() + 30_000);
      }
      await expect(
        t.mutation(printJobFunctions.create, input)
      ).resolves.toStrictEqual({
        id: job.id,
        status: "failed",
      });
      await expect(
        t.mutation(printJobFunctions.retry, { jobId: job.id, secret })
      ).resolves.toStrictEqual({ id: job.id, status: "queued" });
      const next = await t.mutation(printJobFunctions.claimNext, {
        now: Date.now(),
        secret,
        workerId,
      });
      expect(next).toMatchObject({
        _id: job.id,
        idempotencyKey: input.idempotencyKey,
        printState: { attempts: 1, retryCount: 1 },
      });
      const records = await t.run((ctx) => ctx.db.query("printJobs").take(10));
      expect(records).toHaveLength(1);
    });

    test("a failed expired job cannot be retried or refreshed with duplicate create", async () => {
      const t = convexTest(schema, modules);
      const jobId = await t.run((ctx) =>
        ctx.db.insert("printJobs", {
          availableAt: initialTime - 10_000,
          expiresAt: initialTime - 1,
          idempotencyKey: input.idempotencyKey,
          payload: input.payload,
          printState: { attempts: 3 },
          source: input.source,
          status: "failed",
        })
      );
      await expect(
        t.mutation(printJobFunctions.retry, { jobId, secret })
      ).resolves.toStrictEqual({ id: jobId, status: "expired" });
      await expect(
        t.mutation(printJobFunctions.create, {
          ...input,
          expiresAt: initialTime + 60_000,
        })
      ).resolves.toStrictEqual({ id: jobId, status: "expired" });
    });

    test("refuses cancellation while a worker owns dispatch", async () => {
      const t = convexTest(schema, modules);
      const job = await t.mutation(printJobFunctions.create, {
        ...input,
        expiresAt: initialTime + 30_000,
      });
      await t.mutation(printJobFunctions.claimNext, {
        now: Date.now(),
        secret,
        workerId,
      });
      await expect(
        t.mutation(printJobFunctions.cancel, { jobId: job.id, secret })
      ).rejects.toThrow("Only queued or failed");
      vi.setSystemTime(initialTime + 30_000);
      await expect(
        t.mutation(printJobFunctions.markFailed, {
          error: "Expired before dispatch",
          jobId: job.id,
          secret,
          workerId,
        })
      ).resolves.toStrictEqual({ retrying: false });
      await expect(
        t.query(printJobFunctions.getStatus, { jobId: job.id, secret })
      ).resolves.toMatchObject({ status: "expired" });
    });

    test("does not reclaim an expired receipt after a worker lease is lost", async () => {
      const t = convexTest(schema, modules);
      const job = await t.mutation(printJobFunctions.create, {
        ...input,
        expiresAt: initialTime + 30_000,
      });
      await t.mutation(printJobFunctions.claimNext, {
        now: Date.now(),
        secret,
        workerId,
      });
      vi.setSystemTime(initialTime + 61_000);
      await expect(
        t.mutation(printJobFunctions.claimNext, {
          now: Date.now(),
          secret,
          workerId: "recovery-worker",
        })
      ).resolves.toBeNull();
      await expect(
        t.query(printJobFunctions.getStatus, { jobId: job.id, secret })
      ).resolves.toMatchObject({
        printState: { attempts: 1 },
        status: "expired",
      });
    });
  });

  describe("print authorization and QR input", () => {
    test.each([
      "https://evil.example/ai",
      "//evil.example/ai",
      "/ai/../admin",
      "/ai/%2e%2e/admin",
      "/ai\\evil",
      "/api/print",
      "/ai?next=https://evil.example",
    ])("rejects unsafe action path %s", async (actionPath) => {
      const t = convexTest(schema, modules);
      await expect(
        t.mutation(printJobFunctions.create, {
          ...input,
          payload: { ...input.payload, actionPath },
        })
      ).rejects.toThrow("Action path must stay within /ai");
    });

    test.each(["", "wrong-secret"])(
      "rejects unauthenticated create and management calls",
      async (badSecret) => {
        const t = convexTest(schema, modules);
        const job = await t.mutation(printJobFunctions.create, input);
        await expect(
          t.mutation(printJobFunctions.create, { ...input, secret: badSecret })
        ).rejects.toThrow("Unauthorized");
        await expect(
          t.query(printJobFunctions.getStatus, {
            jobId: job.id,
            secret: badSecret,
          })
        ).rejects.toThrow("Unauthorized");
        await expect(
          t.mutation(printJobFunctions.cancel, {
            jobId: job.id,
            secret: badSecret,
          })
        ).rejects.toThrow("Unauthorized");
        await expect(
          t.mutation(printJobFunctions.retry, {
            jobId: job.id,
            secret: badSecret,
          })
        ).rejects.toThrow("Unauthorized");
        await expect(
          t.mutation(printJobFunctions.claimNext, {
            now: Date.now(),
            secret: badSecret,
            workerId,
          })
        ).rejects.toThrow("Unauthorized");
      }
    );

    test("fails closed when the server print secret is absent", async () => {
      // oxlint-disable-next-line unicorn/no-useless-undefined -- Vitest requires an explicit value to remove an env variable.
      vi.stubEnv("PRINT_SECRET", undefined);
      const t = convexTest(schema, modules);
      await expect(t.mutation(printJobFunctions.create, input)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });
});
