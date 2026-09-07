/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import type { FunctionArgs } from "convex/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { api } from "../_generated/api";
import { DAY_MS } from "../ai_helpers";
import schema from "../schema";

const modules = import.meta.glob(["../**/*.*s", "!../__tests__/**/*.*s"]);
vi.mock(import("fluent-convex"), () => {
  const packageSource = [
    "../../node_modules/fluent-convex/src",
    "index.ts",
  ].join("/");
  return import(packageSource);
});

const SECRET = "ai-machine-test-secret";
const PHONE = "+15555550123";
const OWNER = {
  issuer: "https://test.example",
  role: "admin",
  subject: "owner",
  tokenIdentifier: "https://test.example|owner",
};
type Candidate = FunctionArgs<typeof api.ai.ingest>["items"][number];

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  const now = Date.now();
  return {
    checkedAt: now,
    evidenceAt: now - 60_000,
    kind: "task",
    nextNotifyAt: now,
    ownership: "confirmed",
    priority: "routine",
    source: "test-detector",
    sourceKey: "refund-1",
    title: "Check refund",
    usefulUntil: now + 7 * DAY_MS,
    whyNow: "Expected credit has not been confirmed.",
    ...overrides,
  };
}

function question(overrides: Partial<Candidate> = {}): Candidate {
  return candidate({
    kind: "question",
    question: {
      noLabel: "Keep tracking the credit",
      noOutcome: "open",
      yesLabel: "Close the refund reminder",
      yesOutcome: "done",
    },
    title: "Has the refund arrived?",
    ...overrides,
  });
}

async function setup() {
  const t = convexTest(schema, modules);
  const owner = t.withIdentity(OWNER);
  await owner.mutation(api.ai.configure, { phone: PHONE });
  return { owner, t };
}

async function add(
  t: Awaited<ReturnType<typeof setup>>["t"],
  input = candidate()
) {
  const result = await t.mutation(api.ai.ingest, {
    items: [input],
    secret: SECRET,
  });
  const [item] = result.items;
  if (!item) {
    throw new Error("Expected an ingested item");
  }
  return item;
}

async function dispatch(t: Awaited<ReturnType<typeof setup>>["t"]) {
  const job = await t.mutation(api.print_jobs.claimNext, {
    now: Date.now(),
    secret: "printer-test-secret",
    workerId: "test-worker",
  });
  if (!job) {
    throw new Error("Expected a ready print job");
  }
  await t.mutation(api.print_jobs.markPrinted, {
    jobId: job._id,
    secret: "printer-test-secret",
    workerId: "test-worker",
  });
}

describe("AI lifecycle", () => {
  beforeEach(() => {
    process.env.AI_AUTOMATION_SECRET = SECRET;
    process.env.PRINT_SECRET = "printer-test-secret";
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-07T16:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("action center authorization", () => {
    test("requires admin authentication and binds ownership exactly once", async () => {
      const t = convexTest(schema, modules);
      await expect(t.query(api.ai.getSettings, {})).rejects.toThrow(
        "Authentication required"
      );
      await expect(
        t.withIdentity({ role: "member" }).mutation(api.ai.configure, {})
      ).rejects.toThrow("Administrator access required");
      const owner = t.withIdentity(OWNER);
      await expect(owner.query(api.ai.getSettings, {})).resolves.toStrictEqual({
        configured: false,
      });
      await owner.mutation(api.ai.configure, { phone: PHONE });
      const outsider = t.withIdentity({
        ...OWNER,
        subject: "other",
        tokenIdentifier: "https://test.example|other",
      });
      await expect(outsider.query(api.ai.getSettings, {})).rejects.toThrow(
        "owner access required"
      );
      await expect(
        outsider.mutation(api.ai.configure, { phone: "+15555550999" })
      ).rejects.toThrow("owner access required");
    });

    test("machine callers fail closed before initialization and with the wrong secret", async () => {
      const t = convexTest(schema, modules);
      await expect(
        t.mutation(api.ai.ingest, { items: [candidate()], secret: SECRET })
      ).rejects.toThrow("Initialize");
      await expect(
        t.mutation(api.ai.ingest, { items: [candidate()], secret: "wrong" })
      ).rejects.toThrow("Unauthorized");
      await expect(
        t.query(api.ai.machineSnapshot, { secret: "wrong" })
      ).rejects.toThrow("Unauthorized");
      await expect(
        t.mutation(api.ai.publish, { idempotencyKey: "no", secret: "wrong" })
      ).rejects.toThrow("Unauthorized");
      await expect(
        t.mutation(api.ai.sms, {
          body: "DONE A1",
          from: PHONE,
          messageSid: "bad-auth",
          secret: "wrong",
        })
      ).rejects.toThrow("Unauthorized");
    });

    test("receipt and item data require their configured owner; settings clear the phone explicitly", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const published = await t.mutation(api.ai.publish, {
        idempotencyKey: "private",
        secret: SECRET,
      });
      if (!published.receiptId) {
        throw new Error("Expected a receipt");
      }
      const outsider = t.withIdentity({
        ...OWNER,
        tokenIdentifier: "other-issuer|owner",
      });
      await expect(
        outsider.query(api.ai.getItem, { code: item.code })
      ).rejects.toThrow("owner access required");
      await expect(
        outsider.query(api.ai.getReceipt, { id: published.receiptId })
      ).rejects.toThrow("owner access required");
      await owner.mutation(api.ai.configure, { paperEnabled: false });
      await expect(owner.query(api.ai.getSettings, {})).resolves.toMatchObject({
        phone: PHONE,
      });
      await owner.mutation(api.ai.configure, { clearPhone: true });
      await expect(
        owner.query(api.ai.getSettings, {})
      ).resolves.not.toHaveProperty("phone");
    });
  });

  describe("source reconciliation", () => {
    test("deduplicates a repeated source key even within one ingest transaction", async () => {
      const { t } = await setup();
      const input = candidate();
      const result = await t.mutation(api.ai.ingest, {
        items: [input, input],
        secret: SECRET,
      });
      expect(result.items.map((item) => item.code)).toStrictEqual(["A1", "A1"]);
      expect(result.items.map((item) => item.result)).toStrictEqual([
        "created",
        "unchanged",
      ]);
      const snapshot = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
      });
      expect(snapshot.items).toHaveLength(1);
      expect(snapshot.settings).not.toHaveProperty("phone");
    });

    test("rejects stale evidence and never extends an unchanged item's useful life", async () => {
      const { owner, t } = await setup();
      const original = candidate({ usefulUntil: Date.now() + DAY_MS });
      const item = await add(t, original);
      vi.setSystemTime(Date.now() + 60_000);
      await add(t, {
        ...original,
        checkedAt: Date.now(),
        evidenceAt: original.evidenceAt - 1,
        title: "Stale replacement",
      });
      await add(t, {
        ...original,
        checkedAt: Date.now(),
        usefulUntil: Date.now() + 10 * DAY_MS,
      });
      const detail = await owner.query(api.ai.getItem, { code: item.code });
      expect(detail?.item).toMatchObject({
        title: original.title,
        usefulUntil: original.usefulUntil,
        version: 1,
      });
    });

    test("does not accept a question without explicit low-impact outcomes", async () => {
      const { t } = await setup();
      await expect(add(t, candidate({ kind: "question" }))).rejects.toThrow(
        "explicit yes/no"
      );
      await expect(add(t, question({ priority: "urgent" }))).rejects.toThrow(
        "stable milestone"
      );
      await expect(
        add(t, candidate({ checkedAt: Date.now() + DAY_MS }))
      ).rejects.toThrow("future");
    });

    test("new question wording gets a new code and old versions cannot make decisions", async () => {
      const { owner, t } = await setup();
      const original = question();
      const old = await add(t, original);
      const receipt = await t.mutation(api.ai.publish, {
        idempotencyKey: "question-before-change",
        secret: SECRET,
      });
      if (!receipt.receiptId) {
        throw new Error("Expected a receipt");
      }
      vi.setSystemTime(Date.now() + 60_000);
      const current = await add(
        t,
        question({ title: "Has the replacement credit arrived?" })
      );
      expect(current.code).not.toBe(old.code);
      await expect(
        owner.mutation(api.ai.respond, {
          action: "yes",
          code: current.code,
          expectedVersion: old.version,
          receiptId: receipt.receiptId,
        })
      ).rejects.toThrow("changed");
      await expect(
        t.mutation(api.ai.sms, {
          body: `YES ${old.code}`,
          from: PHONE,
          messageSid: "old-code",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ handled: true, status: "queued" });
      const readback = await owner.query(api.ai.getReceipt, {
        id: receipt.receiptId,
      });
      expect(readback?.items[0]?.changed).toBeTruthy();
    });

    test("explicit user dismissal survives newer source evidence and attempted resolution", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      await owner.mutation(api.ai.respond, {
        action: "not_mine",
        code: item.code,
        expectedVersion: item.version,
      });
      vi.setSystemTime(Date.now() + 120_000);
      const refreshed = await add(
        t,
        candidate({ resolution: "resolved", title: "Reopened by collector" })
      );
      expect(refreshed.result).toBe("user-choice-preserved");
      const readback1 = await owner.query(api.ai.getItem, { code: item.code });
      expect(readback1?.item).toMatchObject({
        resolutionReason: "not_mine",
        status: "dismissed",
        title: "Check refund",
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "ignored",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 0, status: "empty" });
    });

    test("No may keep an item pending without printing it again; only newer evidence can close it", async () => {
      const { owner, t } = await setup();
      const original = question();
      const item = await add(t, original);
      await owner.mutation(api.ai.respond, {
        action: "no",
        code: item.code,
        expectedVersion: item.version,
      });
      vi.setSystemTime(Date.now() + 60_000);
      await add(t, {
        ...original,
        checkedAt: Date.now(),
        resolution: "resolved",
      });
      const readback2 = await owner.query(api.ai.getItem, { code: item.code });
      expect(readback2?.item).toMatchObject({
        appearances: 0,
        decision: "no",
        status: "open",
      });
      vi.setSystemTime(Date.now() + 120_000);
      await add(t, question({ resolution: "resolved" }));
      const readback3 = await owner.query(api.ai.getItem, { code: item.code });
      expect(readback3?.item.status).toBe("done");
    });
  });

  describe("paper selection and decisions", () => {
    test("a queued reservation blocks duplicate paper, and expiry releases it without consuming an appearance", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      await t.mutation(api.ai.publish, {
        expiresAt: Date.now() + 60_000,
        idempotencyKey: "reservation",
        secret: SECRET,
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "duplicate-new-key",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      const reserved = await owner.query(api.ai.getItem, { code: item.code });
      expect(reserved?.item).toMatchObject({ appearances: 0 });
      vi.setSystemTime(Date.now() + 60_001);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "after-expiry",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1, status: "queued" });
      const current = await owner.query(api.ai.getItem, { code: item.code });
      expect(current?.item.appearances).toBe(0);
    });

    test("an unknown item gets at most one explicit relevance question, never an unknown task", async () => {
      const { owner, t } = await setup();
      const item = await add(
        t,
        question({
          ownership: "unknown",
          question: {
            noLabel: "Dismiss this topic",
            noOutcome: "dismissed",
            yesLabel: "This matters to me",
            yesOutcome: "open",
          },
          questionPurpose: "relevance",
        })
      );
      await add(
        t,
        candidate({ ownership: "unknown", sourceKey: "unassigned-task" })
      );
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "relevance",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1 });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "relevance-again",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      await owner.mutation(api.ai.respond, {
        action: "yes",
        code: item.code,
        expectedVersion: item.version,
      });
      const current = await owner.query(api.ai.getItem, { code: item.code });
      expect(current?.item).toMatchObject({
        ownership: "confirmed",
        status: "open",
      });
    });

    test("an urgent condition prints once per explicit milestone", async () => {
      const { t } = await setup();
      await add(
        t,
        candidate({ priority: "urgent", urgentMilestone: "due-today" })
      );
      await t.mutation(api.ai.publish, {
        idempotencyKey: "urgent-first",
        secret: SECRET,
      });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "urgent-unchanged",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      await add(
        t,
        candidate({
          priority: "urgent",
          urgentMilestone: "new-failure-confirmed",
        })
      );
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "urgent-new",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1 });
    });

    test("closed history cannot push an older open action out of publication", async () => {
      const { t } = await setup();
      await add(t);
      await t.run(async (ctx) => {
        await Promise.all(
          Array.from({ length: 501 }, (_, index) =>
            ctx.db.insert("aiItems", {
              ...candidate({ sourceKey: `history-${index}` }),
              appearances: 2,
              code: `H${index}`,
              ownerTokenIdentifier: OWNER.tokenIdentifier,
              status: "done",
              version: 1,
            })
          )
        );
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "old-open",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1 });
      const snapshot = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
      });
      expect(snapshot).toMatchObject({
        coverage: "active-and-recent-history",
        truncated: true,
      });
    });

    test("selects at most three confirmed live actions and queues the receipt atomically", async () => {
      const { owner, t } = await setup();
      await t.mutation(api.ai.ingest, {
        items: [
          candidate({ ownership: "unknown", sourceKey: "unknown" }),
          candidate({ sourceKey: "expired", usefulUntil: Date.now() - 1 }),
          ...Array.from({ length: 4 }, (_, index) =>
            candidate({ sourceKey: `live-${index}` })
          ),
        ],
        secret: SECRET,
      });
      const result = await t.mutation(api.ai.publish, {
        idempotencyKey: "morning",
        secret: SECRET,
      });
      expect(result).toMatchObject({ count: 3, status: "queued" });
      if (!result.receiptId) {
        throw new Error("Expected a receipt");
      }
      const receipt = await owner.query(api.ai.getReceipt, {
        id: result.receiptId,
      });
      expect(receipt?.items).toHaveLength(3);
      const jobs = await t.run((ctx) => ctx.db.query("printJobs").take(10));
      expect(jobs).toMatchObject([
        {
          aiReceiptId: result.receiptId,
          expiresAt: receipt?.receipt.expiresAt,
          payload: { actionPath: `/ai/r/${result.receiptId}` },
          status: "queued",
        },
      ]);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "morning",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 3, status: "duplicate" });
      await owner.query(api.ai.getReceipt, { id: result.receiptId });
      await expect(
        t.run((ctx) => ctx.db.query("aiActions").take(10))
      ).resolves.toHaveLength(0);
    });

    test("a brief caps actions at three and calendar agenda at five within the print body limit", async () => {
      const { owner, t } = await setup();
      await t.mutation(api.ai.ingest, {
        items: [
          ...Array.from({ length: 4 }, (_, index) =>
            question({
              question: {
                noLabel: "N".repeat(100),
                noOutcome: "open",
                yesLabel: "Y".repeat(100),
                yesOutcome: "done",
              },
              sourceKey: `action-${index}`,
              title: "A".repeat(120),
              whyNow: "W".repeat(360),
            })
          ),
          ...Array.from({ length: 6 }, (_, index) =>
            candidate({
              dueAt: Date.now() + (index + 1) * 60_000,
              kind: "info",
              source: "calendar-agenda",
              sourceKey: `event-${index}`,
              title: "C".repeat(120),
              whyNow: "W".repeat(360),
            })
          ),
          candidate({ kind: "info", sourceKey: "unrelated-info" }),
        ],
        secret: SECRET,
      });
      const result = await t.mutation(api.ai.publish, {
        idempotencyKey: "brief",
        mode: "brief",
        secret: SECRET,
      });
      expect(result).toMatchObject({ count: 8, status: "queued" });
      if (!result.receiptId) {
        throw new Error("Expected a receipt");
      }
      const receipt = await owner.query(api.ai.getReceipt, {
        id: result.receiptId,
      });
      expect(
        receipt?.items.map(({ current }) => current?.sourceKey)
      ).toStrictEqual([
        "action-0",
        "action-1",
        "action-2",
        "event-0",
        "event-1",
        "event-2",
        "event-3",
        "event-4",
      ]);
      const job = await t.run((ctx) => ctx.db.query("printJobs").first());
      expect(job?.payload.body.length).toBeLessThanOrEqual(4000);
      expect(job?.payload).toMatchObject({
        actionPath: `/ai/r/${result.receiptId}`,
        title: "TODAY",
      });
      expect(
        receipt?.items.every(
          ({ current }) => current?.pendingReceiptId === result.receiptId
        )
      ).toBeTruthy();
    });

    test("an agenda-only brief is silent for ineligible or reserved items", async () => {
      const { owner, t } = await setup();
      await t.mutation(api.ai.ingest, {
        items: [
          candidate({ sourceKey: "expired", usefulUntil: Date.now() - 1 }),
          candidate({ ownership: "unknown", sourceKey: "unknown" }),
          candidate({ nextNotifyAt: Date.now() + DAY_MS, sourceKey: "later" }),
          candidate({ kind: "info", sourceKey: "unrelated-info" }),
        ].map((item) => ({
          ...item,
          kind: "info" as const,
          source:
            item.sourceKey === "unrelated-info"
              ? "test-detector"
              : "calendar-agenda",
        })),
        secret: SECRET,
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "nothing-due",
          mode: "brief",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 0, status: "empty" });
      await add(t, candidate({ kind: "info", source: "calendar-agenda" }));
      await owner.mutation(api.ai.configure, {
        pausedSources: ["calendar-agenda"],
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "agenda-paused",
          mode: "brief",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 0, status: "empty" });
      await owner.mutation(api.ai.configure, { pausedSources: [] });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "agenda-only",
          mode: "brief",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1, status: "queued" });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "agenda-reserved",
          mode: "brief",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 0, status: "empty" });
    });

    test.each(["expired", "dismissed", "source-paused"] as const)(
      "a queued brief honors %s agenda state before printing",
      async (change) => {
        const { owner, t } = await setup();
        const usefulUntil = Date.now() + 60_000;
        const item = await add(
          t,
          candidate({ kind: "info", source: "calendar-agenda", usefulUntil })
        );
        await t.mutation(api.ai.publish, {
          idempotencyKey: "agenda-lifecycle",
          mode: "brief",
          secret: SECRET,
        });
        if (change === "expired") {
          vi.setSystemTime(usefulUntil);
        } else if (change === "dismissed") {
          await owner.mutation(api.ai.respond, {
            action: "ignore",
            code: item.code,
            expectedVersion: item.version,
          });
        } else {
          await owner.mutation(api.ai.configure, {
            pausedSources: ["calendar-agenda"],
          });
        }
        await expect(
          t.mutation(api.print_jobs.claimNext, {
            now: Date.now(),
            secret: "printer-test-secret",
            workerId: "test-worker",
          })
        ).resolves.toBeNull();
        const job = await t.run((ctx) => ctx.db.query("printJobs").first());
        expect(job).toMatchObject({
          expiresAt: usefulUntil,
          status: change === "expired" ? "expired" : "cancelled",
        });
        const current = await owner.query(api.ai.getItem, { code: item.code });
        expect(current?.item.appearances).toBe(0);
        expect(current?.item.pendingReceiptId).toBeUndefined();
      }
    );

    test("ordinary unchanged items appear at most twice, even with new publish keys", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      await t.mutation(api.ai.publish, {
        idempotencyKey: "first",
        secret: SECRET,
      });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, { idempotencyKey: "second", secret: SECRET })
      ).resolves.toMatchObject({ count: 1 });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, { idempotencyKey: "third", secret: SECRET })
      ).resolves.toMatchObject({ count: 0, status: "empty" });
      const readback4 = await owner.query(api.ai.getItem, { code: item.code });
      expect(readback4?.item.appearances).toBe(2);
    });

    test("explicit snooze grants a twice-printed item one reminder at the chosen hour", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      await t.mutation(api.ai.publish, {
        idempotencyKey: "cap-first",
        secret: SECRET,
      });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await t.mutation(api.ai.publish, {
        idempotencyKey: "cap-second",
        secret: SECRET,
      });
      await dispatch(t);
      const until = Date.now() + 3_600_000;
      await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: item.version,
        snoozeUntil: until,
      });
      const snoozed = await owner.query(api.ai.getItem, { code: item.code });
      expect(snoozed?.item.nextNotifyAt).toBe(until);
      vi.setSystemTime(until - 1);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "cap-too-early",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      vi.setSystemTime(until);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "cap-user-reminder",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1 });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "cap-after-reminder",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      const current = await owner.query(api.ai.getItem, { code: item.code });
      expect(current?.item.appearances).toBe(3);
    });

    test("snoozing a pending No answer grants one reminder and preserves the answer afterward", async () => {
      const { owner, t } = await setup();
      const item = await add(t, question());
      const answer = await owner.mutation(api.ai.respond, {
        action: "no",
        code: item.code,
        expectedVersion: item.version,
      });
      const until = Date.now() + 3_600_000;
      await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: answer.version,
        snoozeUntil: until,
      });
      vi.setSystemTime(until);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "answer-reminder",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1 });
      await dispatch(t);
      const current = await owner.query(api.ai.getItem, { code: item.code });
      expect(current?.item).toMatchObject({
        appearances: 1,
        decision: "no",
        status: "open",
      });
      expect(
        current?.actions.some((action) => action.action === "no")
      ).toBeTruthy();
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "answer-after-reminder",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
    });

    test("explicit snooze grants one reminder for an already-notified urgent milestone", async () => {
      const { owner, t } = await setup();
      const item = await add(
        t,
        candidate({ priority: "urgent", urgentMilestone: "same-deadline" })
      );
      await t.mutation(api.ai.publish, {
        idempotencyKey: "milestone-first",
        secret: SECRET,
      });
      await dispatch(t);
      const until = Date.now() + 3_600_000;
      await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: item.version,
        snoozeUntil: until,
      });
      vi.setSystemTime(until);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "milestone-user-reminder",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1 });
      await dispatch(t);
      vi.setSystemTime(Date.now() + DAY_MS);
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "milestone-after-reminder",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
    });

    test("snoozes survive fresh source refreshes and resume only at the chosen time", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const until = Date.now() + 2 * DAY_MS;
      await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: item.version,
        snoozeUntil: until,
      });
      vi.setSystemTime(Date.now() + 120_000);
      await add(t, candidate({ title: "Fresh title before snooze expires" }));
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "snoozed",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 0 });
      vi.setSystemTime(until);
      await expect(
        t.mutation(api.ai.publish, { idempotencyKey: "resume", secret: SECRET })
      ).resolves.toMatchObject({ count: 1 });
    });

    test("receipt expiry blocks old paper decisions while the current item remains usable", async () => {
      const { owner, t } = await setup();
      const item = await add(t, question());
      const receipt = await t.mutation(api.ai.publish, {
        expiresAt: Date.now() + 60_000,
        idempotencyKey: "short-lived",
        secret: SECRET,
      });
      if (!receipt.receiptId) {
        throw new Error("Expected a receipt");
      }
      vi.setSystemTime(Date.now() + 60_001);
      const readback5 = await owner.query(api.ai.getReceipt, {
        id: receipt.receiptId,
      });
      expect(readback5?.expired).toBeTruthy();
      await expect(
        owner.mutation(api.ai.respond, {
          action: "yes",
          code: item.code,
          expectedVersion: item.version,
          receiptId: receipt.receiptId,
        })
      ).rejects.toThrow("expired");
      await expect(
        owner.mutation(api.ai.respond, {
          action: "yes",
          code: item.code,
          expectedVersion: item.version,
        })
      ).resolves.toMatchObject({ status: "done" });
    });

    test("only the last unchanged own action can be undone", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const snooze = await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: item.version,
        snoozeUntil: Date.now() + DAY_MS,
      });
      const done = await owner.mutation(api.ai.respond, {
        action: "done",
        code: item.code,
        expectedVersion: snooze.version,
      });
      await expect(
        owner.mutation(api.ai.undo, { actionId: snooze.actionId })
      ).rejects.toThrow("changed");
      await expect(
        owner.mutation(api.ai.undo, { actionId: done.actionId })
      ).resolves.toMatchObject({ status: "snoozed" });
      await expect(
        owner.mutation(api.ai.undo, { actionId: done.actionId })
      ).rejects.toThrow("latest");
    });

    test("paused paper, paused sources, and informational mode all honor central policy", async () => {
      const { owner, t } = await setup();
      await add(t, candidate({ kind: "info" }));
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "actions",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      await owner.mutation(api.ai.configure, {
        pausedSources: ["test-detector"],
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "paused-source",
          mode: "timed",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "empty" });
      await owner.mutation(api.ai.configure, {
        paperEnabled: false,
        pausedSources: [],
      });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "paused-paper",
          mode: "timed",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ status: "paused" });
      await owner.mutation(api.ai.configure, { paperEnabled: true });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "timed",
          mode: "timed",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1, status: "queued" });
    });
  });

  describe("current item queries", () => {
    test("expired history cannot block current views or receipt publication", async () => {
      const { owner, t } = await setup();
      await t.run((ctx) =>
        Promise.all(
          Array.from({ length: 501 }, (_, index) =>
            ctx.db.insert("aiItems", {
              ...candidate({
                sourceKey: `old-${index}`,
                usefulUntil: Date.now() - 1,
              }),
              appearances: 0,
              code: `OLD${index}`,
              ownerTokenIdentifier: OWNER.tokenIdentifier,
              status: index % 2 === 0 ? "open" : "snoozed",
              version: 1,
            })
          )
        )
      );
      const current = await add(t);
      const today = await owner.query(api.ai.list, {
        now: Date.now(),
        view: "today",
      });
      expect(today.map((item) => item.code)).toStrictEqual([current.code]);
      await expect(
        owner.query(api.ai.list, { now: Date.now(), view: "upcoming" })
      ).resolves.toHaveLength(0);
      await expect(
        owner.query(api.ai.list, { now: Date.now(), view: "snoozed" })
      ).resolves.toHaveLength(0);
      const history = await owner.query(api.ai.list, {
        now: Date.now(),
        view: "history",
      });
      expect({
        count: history.length,
        expired: history.every((item) => item.usefulUntil < Date.now()),
      }).toStrictEqual({ count: 100, expired: true });
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "unclogged",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ count: 1, status: "queued" });
    });

    test("more than 500 genuinely current items still fails closed", async () => {
      const { owner, t } = await setup();
      await t.run((ctx) =>
        Promise.all(
          Array.from({ length: 501 }, (_, index) =>
            ctx.db.insert("aiItems", {
              ...candidate({ sourceKey: `current-${index}` }),
              appearances: 0,
              code: `CURRENT${index}`,
              ownerTokenIdentifier: OWNER.tokenIdentifier,
              status: "open",
              version: 1,
            })
          )
        )
      );
      await expect(
        owner.query(api.ai.list, { now: Date.now(), view: "today" })
      ).rejects.toThrow("more than 500 active items");
      await expect(
        t.mutation(api.ai.publish, {
          idempotencyKey: "over-cap",
          secret: SECRET,
        })
      ).rejects.toThrow("coverage would be incomplete");
    });

    test("explicit query time moves due and snoozed items without a database write", async () => {
      const { owner, t } = await setup();
      const now = Date.now();
      const item = await add(t);
      await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: item.version,
        snoozeUntil: now + 60_000,
      });
      await expect(
        owner.query(api.ai.list, { now, view: "today" })
      ).resolves.toHaveLength(0);
      await expect(
        owner.query(api.ai.list, { now, view: "snoozed" })
      ).resolves.toHaveLength(1);
      await expect(
        owner.query(api.ai.list, { now: now + 60_000, view: "today" })
      ).resolves.toHaveLength(1);
      await expect(
        owner.query(api.ai.list, { now: now + 60_000, view: "snoozed" })
      ).resolves.toHaveLength(0);
    });
  });

  describe("replies and health", () => {
    test("stores owner SMS verbatim without interpreting a decision", async () => {
      const { owner, t } = await setup();
      const item = await add(t, question());
      const body = `  No, I already handled ${item.code}.\r\nPlease stop tracking this.  `;
      const args = {
        body,
        from: PHONE,
        messageSid: "raw-reply",
        secret: SECRET,
      };
      const stored = await t.mutation(api.ai.sms, args);
      expect(stored).toMatchObject({ handled: true, status: "queued" });
      await expect(t.mutation(api.ai.sms, args)).resolves.toMatchObject({
        status: "duplicate",
      });
      await expect(
        t.mutation(api.ai.sms, { ...args, body: "Changed body" })
      ).rejects.toThrow("different content");
      const snapshot = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
      });
      const current = await owner.query(api.ai.getItem, { code: item.code });
      expect({
        actions: current?.actions.length,
        replies: snapshot.replies.map((reply) => ({
          body: reply.body,
          itemCode: reply.itemCode ?? null,
          source: reply.source,
          status: reply.status,
        })),
        status: current?.item.status,
      }).toStrictEqual({
        actions: 0,
        replies: [{ body, itemCode: null, source: "sms", status: "pending" }],
        status: "open",
      });
      await expect(
        t.run((ctx) => ctx.db.query("printJobs").take(10))
      ).resolves.toHaveLength(0);
    });

    test("SMS retries retain original context after item and phone changes", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const args = {
        body: `${item.code} Please stop tracking this`,
        from: PHONE,
        messageSid: "retry-identity",
        secret: SECRET,
      };
      await t.mutation(api.ai.sms, args);
      vi.setSystemTime(Date.now() + 120_000);
      await add(t, candidate({ title: "Changed task" }));
      await expect(t.mutation(api.ai.sms, args)).resolves.toMatchObject({
        handled: true,
        status: "duplicate",
      });
      await owner.mutation(api.ai.configure, { phone: "+15555550234" });
      await expect(t.mutation(api.ai.sms, args)).resolves.toMatchObject({
        handled: true,
        status: "duplicate",
      });
      await expect(
        t.mutation(api.ai.sms, { ...args, from: "+15555550234" })
      ).rejects.toThrow("different content or sender");
      const snapshot = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
      });
      expect(
        snapshot.replies.map((reply) => ({
          body: reply.body,
          itemCode: reply.itemCode,
          itemVersion: reply.itemVersion,
        }))
      ).toStrictEqual([
        { body: args.body, itemCode: item.code, itemVersion: item.version },
      ]);
    });

    test("unconfigured SMS and web feedback fail closed", async () => {
      const t = convexTest(schema, modules);
      const args = {
        body: "Private reply",
        from: PHONE,
        messageSid: "unconfigured",
        secret: SECRET,
      };
      await expect(t.mutation(api.ai.sms, args)).rejects.toThrow("Initialize");
      const owner = t.withIdentity(OWNER);
      await expect(
        owner.mutation(api.ai.submitFeedback, {
          body: "Private",
          idempotencyKey: "not-initialized",
        })
      ).rejects.toThrow("Initialize");
      await owner.mutation(api.ai.configure, {});
      await expect(t.mutation(api.ai.sms, args)).rejects.toThrow(
        "Configure the owner phone"
      );
    });

    test("does not capture messages from other senders", async () => {
      const { t } = await setup();
      await expect(
        t.mutation(api.ai.sms, {
          body: "Y A1",
          from: "+15555550999",
          messageSid: "foreign",
          secret: SECRET,
        })
      ).resolves.toMatchObject({ handled: false, status: "unauthorized" });
      await expect(
        t.run((ctx) => ctx.db.query("aiReplies").take(10))
      ).resolves.toHaveLength(0);
    });

    test("web feedback requires its owner and rejects conflicting idempotency keys", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const args = {
        body: "Handled this already",
        code: item.code,
        idempotencyKey: "web-feedback",
      };
      await expect(t.mutation(api.ai.submitFeedback, args)).rejects.toThrow(
        "Authentication required"
      );
      await expect(
        t
          .withIdentity({ ...OWNER, tokenIdentifier: "other-owner" })
          .mutation(api.ai.submitFeedback, args)
      ).rejects.toThrow("owner access required");
      const first = await owner.mutation(api.ai.submitFeedback, args);
      await expect(
        owner.mutation(api.ai.submitFeedback, args)
      ).resolves.toMatchObject({ ...first, duplicate: true });
      await expect(
        owner.mutation(api.ai.submitFeedback, { ...args, body: "Never mind" })
      ).rejects.toThrow("different content");
      const snapshot = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
        source: "another-source",
      });
      expect(snapshot.replies[0]).toMatchObject({
        body: args.body,
        itemCode: item.code,
        itemSource: "test-detector",
        itemVersion: item.version,
      });
    });

    test("agents apply a reply once and acknowledge only after processing", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const { replyId } = await owner.mutation(api.ai.submitFeedback, {
        body: "Done",
        code: item.code,
        idempotencyKey: "decision",
      });
      const args = {
        action: "done" as const,
        code: item.code,
        expectedVersion: item.version,
        replyId,
        secret: SECRET,
      };
      await expect(
        t.mutation(api.ai.applyReplyDecision, { ...args, secret: "wrong" })
      ).rejects.toThrow("Unauthorized");
      const applied = await t.mutation(api.ai.applyReplyDecision, args);
      expect(applied).toMatchObject({ duplicate: false, version: 2 });
      await expect(
        t.mutation(api.ai.applyReplyDecision, args)
      ).resolves.toMatchObject({
        actionId: applied.actionId,
        duplicate: true,
        version: 2,
      });
      await expect(
        t.mutation(api.ai.applyReplyDecision, { ...args, action: "ignore" })
      ).rejects.toThrow("different decision");
      const pending = await t.query(api.ai.machineSnapshot, { secret: SECRET });
      expect(pending.replies).toHaveLength(1);
    });

    test("acknowledgment preserves the original reply and prevents replay after a later user action", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const { replyId } = await owner.mutation(api.ai.submitFeedback, {
        body: "Done",
        code: item.code,
        idempotencyKey: "acknowledged-decision",
      });
      const args = {
        action: "done" as const,
        code: item.code,
        expectedVersion: item.version,
        replyId,
        secret: SECRET,
      };
      const applied = await t.mutation(api.ai.applyReplyDecision, args);
      const acknowledgment = {
        replyId,
        result: "Marked done and verified the current item",
        secret: SECRET,
      };
      await t.mutation(api.ai.acknowledgeReply, acknowledgment);
      await expect(
        t.mutation(api.ai.acknowledgeReply, acknowledgment)
      ).resolves.toMatchObject({ duplicate: true });
      await owner.mutation(api.ai.undo, { actionId: applied.actionId });
      await expect(t.mutation(api.ai.applyReplyDecision, args)).rejects.toThrow(
        "already been processed"
      );
      const readback = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
      });
      expect(readback.replies).toHaveLength(0);
      await expect(
        t.run((ctx) => ctx.db.get("aiReplies", replyId))
      ).resolves.toMatchObject({
        body: "Done",
        result: acknowledgment.result,
        status: "processed",
      });
    });

    test("stale contextual replies cannot apply a decision to a newer item version", async () => {
      const { owner, t } = await setup();
      const item = await add(t);
      const { replyId } = await owner.mutation(api.ai.submitFeedback, {
        body: "Snooze this",
        code: item.code,
        idempotencyKey: "stale",
      });
      await owner.mutation(api.ai.respond, {
        action: "snooze",
        code: item.code,
        expectedVersion: item.version,
        snoozeUntil: Date.now() + DAY_MS,
      });
      await expect(
        t.mutation(api.ai.applyReplyDecision, {
          action: "done",
          code: item.code,
          expectedVersion: item.version,
          replyId,
          secret: SECRET,
        })
      ).rejects.toThrow("changed");
      await expect(
        t.mutation(api.ai.applyReplyDecision, {
          action: "done",
          code: item.code,
          expectedVersion: item.version + 1,
          replyId,
          secret: SECRET,
        })
      ).rejects.toThrow("different item version");
    });

    test("reading pending replies is bounded and does not acknowledge; processing drains later pages", async () => {
      const { t } = await setup();
      await t.run((ctx) =>
        Promise.all(
          Array.from({ length: 101 }, (_, index) =>
            ctx.db.insert("aiReplies", {
              body: `Reply ${index}`,
              createdAt: Date.now() + index,
              idempotencyKey: `queued-${index}`,
              ownerTokenIdentifier: OWNER.tokenIdentifier,
              source: "sms",
              status: "pending",
            })
          )
        )
      );
      const first = await t.query(api.ai.machineSnapshot, { secret: SECRET });
      expect({
        count: first.replies.length,
        truncated: first.repliesTruncated,
      }).toStrictEqual({ count: 100, truncated: true });
      if (!first.nextReplyCursor) {
        throw new Error("Expected a reply cursor");
      }
      const secondPage = await t.query(api.ai.machineSnapshot, {
        replyCursor: first.nextReplyCursor,
        secret: SECRET,
      });
      expect({
        cursor: secondPage.nextReplyCursor,
        replies: secondPage.replies.map((reply) => reply.body),
      }).toStrictEqual({ cursor: null, replies: ["Reply 100"] });
      const repeated = await t.query(api.ai.machineSnapshot, {
        secret: SECRET,
        source: "unknown",
      });
      expect(repeated.replies.map((reply) => reply._id)).toStrictEqual(
        first.replies.map((reply) => reply._id)
      );
      const [reply] = first.replies;
      if (!reply) {
        throw new Error("Expected a reply");
      }
      await t.mutation(api.ai.acknowledgeReply, {
        replyId: reply._id,
        result: "Processed",
        secret: SECRET,
      });
      const next = await t.query(api.ai.machineSnapshot, { secret: SECRET });
      expect({
        last: next.replies.at(-1)?.body,
        truncated: next.repliesTruncated,
      }).toStrictEqual({ last: "Reply 100", truncated: false });
    });

    test("health distinguishes stale source checks and expired paper from queue acceptance", async () => {
      const { owner, t } = await setup();
      await add(t);
      await t.mutation(api.ai.recordHealth, {
        checkedAt: Date.now(),
        coverageThrough: Date.now() - 60_000,
        secret: SECRET,
        source: "mail",
        status: "partial",
      });
      await t.mutation(api.ai.publish, {
        idempotencyKey: "health",
        secret: SECRET,
      });
      vi.setSystemTime(Date.now() + DAY_MS + 1);
      const current = await owner.query(api.ai.health, {});
      expect(current.sources[0]).toMatchObject({
        stale: true,
        status: "partial",
      });
      expect(current.receipts[0]).toMatchObject({
        expired: true,
        printStatus: "queued",
      });
    });
  });
});
