import type { Doc, Id } from "@repo/backend/data-model";

export type AiItem = Doc<"aiItems">;
export type AiResponse = {
  action: Exclude<Doc<"aiActions">["action"], "undo">;
  code: string;
  expectedVersion: number;
  receiptId?: Id<"aiReceipts">;
  snoozeUntil?: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Los_Angeles",
});

export function formatTime(value: number) {
  return dateFormatter.format(value);
}

export function safeEvidenceUrl(value: string | undefined) {
  if (!value) {
    return;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    // An invalid URL has no source link.
  }
}

export function snoozeDate(days: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date.getTime();
}

export function textReplyHref(command: string) {
  return `sms:+18556248626?body=${encodeURIComponent(command)}`;
}

export function actionError(error: unknown) {
  if (error instanceof Error) {
    // Convex errors can include a server stack. Keep the visible explanation short.
    const match = error.message.match(
      /Uncaught (?:Error|ConvexError): (?<message>[^\n]+)/u
    );
    return (
      match?.groups?.message ??
      error.message.split("\n")[0] ??
      "Please try again."
    );
  }
  return "That change could not be saved. Please try again.";
}
