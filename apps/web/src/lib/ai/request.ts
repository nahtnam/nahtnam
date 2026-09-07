/* oxlint-disable no-await-in-loop -- A request stream must be read and cancelled sequentially. */
import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

const timestamp = z.number().int().nonnegative().max(8_640_000_000_000_000);
const outcome = z.enum(["open", "done", "dismissed"]);
const candidate = z.strictObject({
  checkedAt: timestamp,
  dueAt: timestamp.optional(),
  evidenceAt: timestamp,
  kind: z.enum(["task", "question", "info"]),
  nextNotifyAt: timestamp,
  ownership: z.enum(["confirmed", "unknown"]),
  priority: z.enum(["routine", "urgent"]),
  question: z
    .strictObject({
      noLabel: z.string().trim().min(1).max(100),
      noOutcome: outcome,
      yesLabel: z.string().trim().min(1).max(100),
      yesOutcome: outcome,
    })
    .optional(),
  questionPurpose: z.literal("relevance").optional(),
  resolution: z.literal("resolved").optional(),
  source: z.string().trim().min(1).max(80),
  sourceKey: z.string().trim().min(1).max(160),
  sourceUrl: z
    .url({ protocol: /^https?$/u })
    .max(1500)
    .optional(),
  title: z.string().trim().min(1).max(120),
  urgentMilestone: z.string().trim().min(1).max(120).optional(),
  usefulUntil: timestamp,
  whyNow: z.string().trim().min(1).max(360),
});

export const aiRequestSchema = z.discriminatedUnion("operation", [
  z.strictObject({
    items: z.array(candidate).min(1).max(50),
    operation: z.literal("upsert"),
  }),
  z.strictObject({
    expiresAt: timestamp.optional(),
    idempotencyKey: z.string().min(1).max(160),
    mode: z.enum(["actions", "brief", "timed"]).optional(),
    operation: z.literal("publish"),
    source: z.string().min(1).max(80).optional(),
    title: z.string().min(1).max(48).optional(),
  }),
  z.strictObject({
    checkedAt: timestamp,
    coverageThrough: timestamp.optional(),
    message: z.string().max(400).optional(),
    operation: z.literal("health"),
    source: z.string().min(1).max(80),
    status: z.enum(["ok", "partial", "blocked"]),
  }),
  z.strictObject({
    code: z.string().min(1).max(40),
    expectedVersion: z.number().int().positive(),
    idempotencyKey: z.string().min(1).max(200),
    operation: z.literal("notify"),
  }),
  z.strictObject({
    action: z.enum(["done", "snooze", "ignore", "not_mine", "yes", "no"]),
    code: z.string().min(1).max(40),
    expectedVersion: z.number().int().positive(),
    operation: z.literal("reply-decision"),
    replyId: z.string().min(1).max(100),
    snoozeUntil: timestamp.optional(),
  }),
  z.strictObject({
    operation: z.literal("acknowledge-reply"),
    replyId: z.string().min(1).max(100),
    result: z.string().trim().min(1).max(1000),
  }),
]);

export type AiRequest = z.infer<typeof aiRequestSchema>;

export function aiJson(value: unknown, status = 200) {
  return Response.json(value, {
    headers: { "Cache-Control": "no-store, private" },
    status,
  });
}

export function authorizeAiRequest(options: {
  request: Request;
  secret?: string;
}) {
  const { request, secret } = options;
  if (!secret) {
    return aiJson({ error: "AI automation access is not configured." }, 503);
  }
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer /u, "");
  if (
    !request.headers.get("authorization")?.startsWith("Bearer ") ||
    !supplied ||
    Buffer.byteLength(supplied) !== Buffer.byteLength(secret) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))
  ) {
    return aiJson({ error: "Unauthorized" }, 401);
  }
}

export async function readAiRequest(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 128_000) {
    throw new Error("Request too large.");
  }
  const reader = request.body?.getReader();
  if (!reader) {
    throw new Error("A JSON request body is required.");
  }
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  for (;;) {
    const result = await reader.read();
    if (result.done) {
      break;
    }
    bytes += result.value.byteLength;
    if (bytes > 128_000) {
      await reader.cancel();
      throw new Error("Request too large.");
    }
    chunks.push(result.value);
  }
  const body = Buffer.concat(chunks).toString("utf-8");
  return aiRequestSchema.parse(JSON.parse(body));
}
