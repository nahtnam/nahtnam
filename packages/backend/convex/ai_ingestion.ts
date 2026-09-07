/* oxlint-disable sonarjs/no-undefined-assignment */
import { v } from "convex/values";
import type { Infer } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  aiError,
  boundedText,
  requirePrimarySettings,
  timestamp,
} from "./ai_helpers";
import { candidateFields } from "./ai_tables";

export const candidateValidator = v.object({
  ...candidateFields,
  resolution: v.optional(v.literal("resolved")),
});
type Candidate = Infer<typeof candidateValidator>;

function validateCandidate(item: Candidate, now: number) {
  boundedText(item.source, "Source", 80);
  boundedText(item.sourceKey, "Source key", 160);
  boundedText(item.title, "Title", 120);
  boundedText(item.whyNow, "Why now", 360);
  for (const [label, value] of Object.entries({
    checkedAt: item.checkedAt,
    evidenceAt: item.evidenceAt,
    nextNotifyAt: item.nextNotifyAt,
    usefulUntil: item.usefulUntil,
  })) {
    timestamp(value, label);
  }
  if (item.dueAt !== undefined) {
    timestamp(item.dueAt, "Due date");
  }
  if (item.evidenceAt > item.checkedAt || item.checkedAt > now + 60_000) {
    aiError("Evidence cannot be newer than its check, or checks in the future");
  }
  if (item.sourceUrl) {
    boundedText(item.sourceUrl, "Source URL", 1500);
    if (!/^https?:\/\//iu.test(item.sourceUrl)) {
      aiError("Source URL must use http or https");
    }
  }
  if ((item.kind === "question") !== Boolean(item.question)) {
    aiError("Question items require explicit yes/no labels and outcomes");
  }
  if (item.question) {
    boundedText(item.question.yesLabel, "Yes label", 100);
    boundedText(item.question.noLabel, "No label", 100);
  }
  if (item.questionPurpose === "relevance") {
    const outcomes =
      item.question?.yesOutcome === "open" &&
      item.question.noOutcome === "dismissed";
    if (item.kind !== "question" || !outcomes || item.priority !== "routine") {
      aiError(
        "Relevance questions must be routine: Yes confirms relevance and stays open; No dismisses"
      );
    }
  }
  if (item.priority === "urgent" && !item.urgentMilestone) {
    aiError("Urgent items require an explicit, stable milestone");
  }
  if (item.urgentMilestone) {
    boundedText(item.urgentMilestone, "Urgent milestone", 120);
  }
}

function semanticValue(item: Candidate | Doc<"aiItems">) {
  return JSON.stringify({
    dueAt: item.dueAt,
    kind: item.kind,
    ownership: item.ownership,
    priority: item.priority,
    question: item.question,
    questionPurpose: item.questionPurpose,
    sourceUrl: item.sourceUrl,
    title: item.title,
    urgentMilestone: item.urgentMilestone,
    whyNow: item.whyNow,
  });
}

function preserveUserChoice(
  current: Doc<"aiItems">,
  input: Candidate,
  now: number
) {
  if (current.userResolutionAt === undefined) {
    return false;
  }
  if (current.status === "done" || current.status === "dismissed") {
    return true;
  }
  if (current.status === "snoozed" && (current.snoozedUntil ?? 0) > now) {
    return true;
  }
  const latestEvidence = Math.max(current.evidenceAt, current.userResolutionAt);
  return current.status === "open" && input.evidenceAt <= latestEvidence;
}

function notificationValues(
  current: Doc<"aiItems"> | null,
  input: Candidate,
  changed: boolean
) {
  const freshChange =
    changed && (!current || input.evidenceAt > current.evidenceAt);
  return {
    appearances: freshChange ? 0 : (current?.appearances ?? 0),
    nextNotifyAt: freshChange
      ? input.nextNotifyAt
      : Math.max(input.nextNotifyAt, current?.nextNotifyAt ?? 0),
    usefulUntil:
      current && !freshChange
        ? Math.min(current.usefulUntil, input.usefulUntil)
        : input.usefulUntil,
  };
}

function pendingAnswerValues(
  current: Doc<"aiItems"> | null,
  input: Candidate,
  changed: boolean
) {
  const newerEvidence =
    input.evidenceAt > (current?.userResolutionAt ?? Infinity);
  if (changed && newerEvidence && current?.status === "open") {
    return { decision: undefined, userResolutionAt: undefined };
  }
  return {
    decision: current?.decision,
    userResolutionAt: current?.userResolutionAt,
  };
}

function candidateValues(
  candidate: Candidate,
  current: Doc<"aiItems"> | null,
  owner: string,
  allocateCode: () => string
) {
  const { resolution, ...input } = candidate;
  const changed = !current || semanticValue(current) !== semanticValue(input);
  const sourceResolved =
    resolution && (!current || input.evidenceAt > current.evidenceAt);
  const increment = changed || sourceResolved ? 1 : 0;
  const version = current ? current.version + increment : 1;
  const code = current && !changed ? current.code : allocateCode();
  return {
    ...input,
    ...notificationValues(current, candidate, changed),
    ...pendingAnswerValues(current, candidate, changed),
    code,
    ownerTokenIdentifier: owner,
    resolutionReason: sourceResolved
      ? "source-resolved"
      : current?.resolutionReason,
    status: sourceResolved
      ? ("done" as const)
      : (current?.status ?? ("open" as const)),
    version,
  };
}

async function ingestCandidate(
  ctx: MutationCtx,
  owner: string,
  candidate: Candidate,
  allocateCode: () => string
) {
  const now = Date.now();
  validateCandidate(candidate, now);
  const current = await ctx.db
    .query("aiItems")
    .withIndex("by_ownerTokenIdentifier_and_source_and_sourceKey", (q) =>
      q
        .eq("ownerTokenIdentifier", owner)
        .eq("source", candidate.source)
        .eq("sourceKey", candidate.sourceKey)
    )
    .unique();
  if (
    current &&
    (candidate.checkedAt <= current.checkedAt ||
      candidate.evidenceAt < current.evidenceAt)
  ) {
    return {
      code: current.code,
      id: current._id,
      result: "unchanged" as const,
      version: current.version,
    };
  }
  if (current && preserveUserChoice(current, candidate, now)) {
    await ctx.db.patch("aiItems", current._id, {
      checkedAt: candidate.checkedAt,
    });
    return {
      code: current.code,
      id: current._id,
      result: "user-choice-preserved" as const,
      version: current.version,
    };
  }
  const values = candidateValues(candidate, current, owner, allocateCode);
  const id = current ? current._id : await ctx.db.insert("aiItems", values);
  if (current) {
    await ctx.db.patch("aiItems", id, values);
  }
  return {
    code: values.code,
    id,
    result: current ? ("updated" as const) : ("created" as const),
    version: values.version,
  };
}

export async function ingestItems(options: {
  ctx: MutationCtx;
  items: Candidate[];
}) {
  const { ctx, items } = options;
  const settings = await requirePrimarySettings(ctx);
  if (items.length > 50) {
    aiError("Ingest at most 50 items per request");
  }
  let { nextCode } = settings;
  const allocateCode = () => {
    const code = `A${nextCode}`;
    nextCode += 1;
    return code;
  };
  const results = [];
  // Batch entries may share a source key; preserve order and allocate each
  // new code exactly once inside this transaction.
  for (const candidate of items) {
    // oxlint-disable-next-line eslint/no-await-in-loop, react-doctor/async-await-in-loop
    const result = await ingestCandidate(
      ctx,
      settings.ownerTokenIdentifier,
      candidate,
      allocateCode
    );
    results.push(result);
  }
  if (nextCode !== settings.nextCode) {
    await ctx.db.patch("aiSettings", settings._id, { nextCode });
  }
  return { items: results };
}
