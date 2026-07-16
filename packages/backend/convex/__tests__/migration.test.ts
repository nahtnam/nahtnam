/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { describe, expect, test, vi } from "vitest";

import type { Doc, Id } from "../_generated/dataModel";
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

type PublicPost = Doc<"blogPosts"> & { category: Doc<"blogCategories"> };

const listPosts = makeFunctionReference<
  "query",
  Record<string, never>,
  PublicPost[]
>("blog/queries:listPosts");
const getPost = makeFunctionReference<
  "query",
  { slug: string },
  PublicPost | null
>("blog/queries:getPost");
const listBookings = makeFunctionReference<
  "query",
  { password: string },
  {
    accepted: Doc<"bnbBookings">[];
    pending: Doc<"bnbBookings">[];
  }
>("bnb/queries:listBookings");
const isAuthorized = makeFunctionReference<
  "query",
  Record<string, never>,
  boolean
>("admin/auth:isAuthorized");
const deleteCategory = makeFunctionReference<
  "mutation",
  { id: Id<"blogCategories"> },
  null
>("admin/blog:deleteCategory");
const deleteCompany = makeFunctionReference<
  "mutation",
  { id: Id<"resumeCompanies"> },
  null
>("admin/resume:deleteCompany");
const acceptBooking = makeFunctionReference<
  "mutation",
  { id: Id<"bnbBookings"> },
  null
>("admin/bnb:acceptBooking");
const rejectBooking = makeFunctionReference<
  "mutation",
  { id: Id<"bnbBookings"> },
  null
>("admin/bnb:rejectBooking");
const createPrintJob = makeFunctionReference<
  "mutation",
  {
    availableAt?: number;
    idempotencyKey?: string;
    payload:
      | { _type: "alert"; body: string; title: string }
      | { _type: "message"; body: string; title?: string };
    secret: string;
    source: string;
  },
  { id: Id<"printJobs">; status: Doc<"printJobs">["status"] }
>("print_jobs:create");
const createTextMessage = makeFunctionReference<
  "mutation",
  {
    body: string;
    from: string;
    messageSid: string;
    secret: string;
  },
  | { id: Id<"printJobs">; status: "queued" }
  | { status: "duplicate" | "rate-limited" }
>("print_jobs:createTextMessage");
const claimNextPrintJob = makeFunctionReference<
  "mutation",
  { now: number; secret: string; workerId: string },
  Doc<"printJobs"> | null
>("print_jobs:claimNext");
const markPrinted = makeFunctionReference<
  "mutation",
  { jobId: Id<"printJobs">; secret: string; workerId: string },
  { ok: true }
>("print_jobs:markPrinted");

process.env.BNB_PASSWORD = "bnb-secret";
process.env.PRINT_SECRET = "print-secret";

describe("migrated public data contracts", () => {
  test("returns published blog content while suppressing drafts and future posts", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      const categoryId = await ctx.db.insert("blogCategories", {
        name: "Projects",
      });

      await ctx.db.insert("blogPosts", {
        categoryId,
        contentPath: "published.mdx",
        excerpt: "Ready now",
        kind: "markdown",
        published: true,
        publishedAt: now - 1000,
        slug: "published",
        title: "Published",
      });
      await ctx.db.insert("blogPosts", {
        categoryId,
        contentPath: "future.mdx",
        excerpt: "Not ready yet",
        kind: "markdown",
        published: true,
        publishedAt: now + 86_400_000,
        slug: "future",
        title: "Future",
      });
      await ctx.db.insert("blogPosts", {
        categoryId,
        contentPath: "draft.mdx",
        excerpt: "A draft",
        kind: "markdown",
        published: false,
        publishedAt: now - 1000,
        slug: "draft",
        title: "Draft",
      });
    });

    const posts = await t.query(listPosts, {});

    expect(posts.map(({ slug }) => slug)).toStrictEqual(["published"]);
    await expect(t.query(getPost, { slug: "future" })).resolves.toBeNull();
    await expect(t.query(getPost, { slug: "draft" })).resolves.toBeNull();
    await expect(
      t.query(getPost, { slug: "published" })
    ).resolves.toMatchObject({
      category: { name: "Projects" },
      slug: "published",
    });
  });

  test("requires the server-held BnB password before exposing bookings", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("bnbBookings", {
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guests: ["Ada"],
        status: "accepted",
      });
      await ctx.db.insert("bnbBookings", {
        checkIn: "2026-09-01",
        checkOut: "2026-09-03",
        guests: ["Grace"],
        status: "pending",
      });
      await ctx.db.insert("bnbBookings", {
        checkIn: "2026-10-01",
        checkOut: "2026-10-03",
        guests: ["Katherine"],
        status: "rejected",
      });
    });

    await expect(t.query(listBookings, { password: "wrong" })).rejects.toThrow(
      "Wrong password"
    );

    const bookings = await t.query(listBookings, { password: "bnb-secret" });

    expect(bookings.accepted.map(({ guests }) => guests[0])).toStrictEqual([
      "Ada",
    ]);
    expect(bookings.pending.map(({ guests }) => guests[0])).toStrictEqual([
      "Grace",
    ]);
  });
});

describe("migrated admin safeguards", () => {
  test("authorizes only identities with the WorkOS admin role", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.withIdentity({ email: "reader@example.com" }).query(isAuthorized, {})
    ).resolves.toBeFalsy();
    await expect(
      t
        .withIdentity({ email: "admin@example.com", role: "admin" })
        .query(isAuthorized, {})
    ).resolves.toBeTruthy();
    await expect(
      t
        .withIdentity({
          email: "admin@example.com",
          roles: ["member", "admin"],
        })
        .query(isAuthorized, {})
    ).resolves.toBeTruthy();
  });

  test("does not delete categories or companies that are still referenced", async () => {
    const t = convexTest(schema, modules);
    const { categoryId, companyId } = await t.run(async (ctx) => {
      const insertedCategoryId = await ctx.db.insert("blogCategories", {
        name: "Writing",
      });
      const insertedCompanyId = await ctx.db.insert("resumeCompanies", {
        logoUrl: "/company.svg",
        name: "Company",
        websiteUrl: "https://example.com",
      });

      await ctx.db.insert("blogPosts", {
        categoryId: insertedCategoryId,
        contentPath: "post.mdx",
        excerpt: "Post",
        kind: "markdown",
        published: true,
        publishedAt: Date.now(),
        slug: "post",
        title: "Post",
      });
      await ctx.db.insert("resumeWorkExperiences", {
        companyId: insertedCompanyId,
        location: "Los Angeles, CA",
        startDate: Date.now(),
        title: "Builder",
      });

      return {
        categoryId: insertedCategoryId,
        companyId: insertedCompanyId,
      };
    });
    const admin = t.withIdentity({
      email: "admin@example.com",
      role: "admin",
    });

    await expect(
      t
        .withIdentity({ email: "reader@example.com", role: "member" })
        .mutation(deleteCategory, { id: categoryId })
    ).rejects.toThrow("Administrator access required");
    await expect(
      admin.mutation(deleteCategory, { id: categoryId })
    ).rejects.toThrow("Delete or reassign this category");
    await expect(
      admin.mutation(deleteCompany, { id: companyId })
    ).rejects.toThrow("Delete or reassign this company");
  });

  test("accepts and rejects BnB requests", async () => {
    const t = convexTest(schema, modules);
    const bookingId = await t.run((ctx) =>
      ctx.db.insert("bnbBookings", {
        checkIn: "2026-08-01",
        checkOut: "2026-08-03",
        guests: ["Ada"],
        status: "pending",
      })
    );
    const admin = t.withIdentity({
      email: "admin@example.com",
      role: "admin",
    });

    await admin.mutation(acceptBooking, { id: bookingId });
    await expect(
      t.run((ctx) => ctx.db.get("bnbBookings", bookingId))
    ).resolves.toMatchObject({ status: "accepted" });

    await admin.mutation(rejectBooking, { id: bookingId });
    await expect(
      t.run((ctx) => ctx.db.get("bnbBookings", bookingId))
    ).resolves.toMatchObject({ status: "rejected" });
  });
});

describe("preserved print worker contract", () => {
  test("accepts legacy text-message jobs from the existing database", async () => {
    const t = convexTest(schema, modules);
    const jobId = await t.run((ctx) =>
      ctx.db.insert("printJobs", {
        availableAt: 100,
        channel: "twilio-sms",
        payload: {
          _type: "text-message",
          body: "Legacy message",
          from: "+15555550123",
        },
        printState: { attempts: 0 },
        source: "twilio-sms:+15555550123",
        status: "queued",
      })
    );

    await expect(
      t.run((ctx) => ctx.db.get("printJobs", jobId))
    ).resolves.toMatchObject({
      channel: "twilio-sms",
      payload: { _type: "text-message" },
    });
  });

  test("deduplicates jobs and enforces claim ownership", async () => {
    const t = convexTest(schema, modules);
    const input = {
      availableAt: 100,
      idempotencyKey: "contact-1",
      payload: {
        _type: "message" as const,
        body: "Hello printer",
      },
      secret: "print-secret",
      source: "contact",
    };

    const first = await t.mutation(createPrintJob, input);
    const duplicate = await t.mutation(createPrintJob, input);
    const claimed = await t.mutation(claimNextPrintJob, {
      now: 100,
      secret: "print-secret",
      workerId: "worker-1",
    });

    expect(duplicate).toStrictEqual(first);
    expect(claimed?._id).toBe(first.id);
    expect(claimed?.printState.attempts).toBe(1);
    await expect(
      t.mutation(markPrinted, {
        jobId: first.id,
        secret: "print-secret",
        workerId: "worker-2",
      })
    ).rejects.toThrow("Job is not claimed by this worker");
    await expect(
      t.mutation(markPrinted, {
        jobId: first.id,
        secret: "print-secret",
        workerId: "worker-1",
      })
    ).resolves.toStrictEqual({ ok: true });
  });

  test("queues Twilio messages once per message SID", async () => {
    const t = convexTest(schema, modules);
    const input = {
      body: "Hello printer",
      from: "+14155550123",
      messageSid: "SM123",
      secret: "print-secret",
    };

    const first = await t.mutation(createTextMessage, input);
    const duplicate = await t.mutation(createTextMessage, input);

    expect(first).toMatchObject({ status: "queued" });
    expect(duplicate).toStrictEqual({ status: "duplicate" });
    await expect(
      t.run((ctx) =>
        ctx.db
          .query("printJobs")
          .withIndex("by_idempotencyKey", (query) =>
            query.eq("idempotencyKey", input.messageSid)
          )
          .unique()
      )
    ).resolves.toMatchObject({
      channel: "twilio-sms",
      payload: {
        _type: "text-message",
        body: input.body,
        from: input.from,
      },
      source: `twilio-sms:${input.from}`,
      status: "queued",
    });
  });

  test("rate limits burst traffic from one sender", async () => {
    const t = convexTest(schema, modules);
    const from = "+14155550123";

    await t.run(async (ctx) => {
      await Promise.all(
        Array.from({ length: 12 }, (_, index) =>
          ctx.db.insert("printJobs", {
            availableAt: Date.now(),
            channel: "twilio-sms",
            idempotencyKey: `existing-${index}`,
            payload: {
              _type: "text-message",
              body: `Message ${index}`,
              from,
            },
            printState: { attempts: 1, printedAt: Date.now() },
            source: `twilio-sms:${from}`,
            status: "printed",
          })
        )
      );
    });

    await expect(
      t.mutation(createTextMessage, {
        body: "One too many",
        from,
        messageSid: "SM-rate-limited",
        secret: "print-secret",
      })
    ).resolves.toStrictEqual({ status: "rate-limited" });
  });
});
