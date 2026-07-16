import type { Doc } from "@repo/backend/data-model";

export type BlogCategory = Doc<"blogCategories">;

export type BlogPost = Doc<"blogPosts"> & {
  category: BlogCategory;
};

export type BlogMedia = Doc<"blogMedia"> & {
  url: null | string;
};

export type WorkspaceNotice = {
  kind: "error" | "info" | "success";
  message: string;
};

export function errorMessage(options: { error: unknown; fallback: string }) {
  const { error, fallback } = options;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const structuredMessage = getStructuredErrorMessage(error);
  if (structuredMessage) {
    return structuredMessage;
  }

  return fallback;
}

function getStructuredErrorMessage(error: unknown) {
  if (!(typeof error === "object" && error !== null && "data" in error)) {
    return null;
  }

  const { data } = error;
  if (!(typeof data === "object" && data !== null && "message" in data)) {
    return null;
  }

  return typeof data.message === "string" ? data.message : null;
}

export function formError(options: { error: unknown; fallback: string }) {
  return {
    errorKind: "business" as const,
    fieldErrors: {},
    formErrors: [errorMessage(options)],
    status: "error" as const,
  };
}

export function markdownForMedia(media: BlogMedia) {
  return media.url ? `![${media.name}](${media.url})` : "";
}

export async function copyText(options: { value: string }) {
  const { value } = options;

  if (!value) {
    throw new Error("This image does not have a public URL yet.");
  }

  await navigator.clipboard.writeText(value);
}

export function toLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
