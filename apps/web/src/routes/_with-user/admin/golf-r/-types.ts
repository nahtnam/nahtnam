import type { Doc, Id } from "@repo/backend/data-model";

export type GolfRItem = Doc<"golfRItems">;

export type AttachmentValue = {
  contentType?: string;
  name: string;
  storageId: Id<"_storage">;
  url?: string;
};

export type BooleanChoice = "false" | "true" | "unset";
