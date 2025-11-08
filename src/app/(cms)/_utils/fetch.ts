import type { OstDocument } from "outstatic";
import {
  getDocumentBySlug as fetchDocumentBySlug,
  getDocuments as fetchDocuments,
} from "outstatic/server";
import type { Documents } from "../types";

const STANDARD_DOCUMENT_FIELDS = [
  "author",
  "collection",
  "content",
  "coverImage",
  "description",
  "publishedAt",
  "slug",
  "status",
  "title",
] as const;

type StandardDocumentField = (typeof STANDARD_DOCUMENT_FIELDS)[number];
type StandardDocumentFields = Pick<OstDocument, StandardDocumentField>;

type DocumentFieldName<TType extends keyof Documents> =
  | Extract<keyof Documents[TType], string>
  | StandardDocumentField;

type DocumentPayload<TType extends keyof Documents> = Documents[TType] &
  StandardDocumentFields;

type DocumentSelection<
  TType extends keyof Documents,
  TFields extends readonly DocumentFieldName<TType>[],
> = Pick<DocumentPayload<TType>, TFields[number]>[];

type DocumentEntry<
  TType extends keyof Documents,
  TFields extends readonly DocumentFieldName<TType>[],
> = Pick<DocumentPayload<TType>, TFields[number]>;

function normalizeFields(fields: readonly string[]) {
  return [...fields] as string[];
}

export function getDocuments<
  TType extends keyof Documents,
  const TFields extends readonly DocumentFieldName<TType>[],
>(documentType: TType, fields: TFields): DocumentSelection<TType, TFields> {
  const selectedFields = normalizeFields(fields);
  return fetchDocuments(
    documentType,
    selectedFields
  ) as unknown as DocumentSelection<TType, TFields>;
}

export function getDocumentBySlug<
  TType extends keyof Documents,
  const TFields extends readonly DocumentFieldName<TType>[],
>(
  documentType: TType,
  slug: string,
  fields: TFields
): DocumentEntry<TType, TFields> | null {
  const selectedFields = normalizeFields(fields);
  return fetchDocumentBySlug(
    documentType,
    slug,
    selectedFields
  ) as unknown as DocumentEntry<TType, TFields> | null;
}
