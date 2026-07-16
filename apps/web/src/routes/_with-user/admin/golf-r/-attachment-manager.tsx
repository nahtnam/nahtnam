import type { Id } from "@repo/backend/data-model";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import type { AttachmentValue } from "./-types";

type AttachmentManagerProps = {
  attachments: AttachmentValue[];
  error: string | null;
  isUploading: boolean;
  onRemove: (storageId: Id<"_storage">) => Promise<void>;
  onUpload: (files: File[]) => Promise<void>;
};

export function AttachmentManager(props: AttachmentManagerProps) {
  const { attachments, error, isUploading, onRemove, onUpload } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedStorageId, setCopiedStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [copyError, setCopyError] = useState<string | null>(null);

  async function copyAttachmentUrl(attachment: AttachmentValue) {
    if (!attachment.url || !globalThis.navigator.clipboard) {
      setCopyError("This browser cannot copy the attachment URL.");
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(attachment.url);
      setCopiedStorageId(attachment.storageId);
      setCopyError(null);
    } catch {
      setCopyError("The attachment URL could not be copied.");
    }
  }

  return (
    <section
      aria-labelledby="golf-r-attachments-heading"
      className="rounded-box border border-base-300 bg-base-200/40 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold" id="golf-r-attachments-heading">
              Private attachments
            </h3>
            <span className="badge badge-sm badge-ghost">
              {attachments.length}
            </span>
          </div>
          <p className="muted mt-1 text-sm">
            Receipts, invoices, and warranty records. These stay in the admin
            workspace.
          </p>
        </div>

        <button
          className="btn btn-sm"
          disabled={isUploading}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <UploadIcon className="size-4" />
          )}
          {isUploading ? "Uploading…" : "Add files"}
        </button>
        <input
          ref={inputRef}
          multiple
          className="hidden"
          type="file"
          onChange={(event) => {
            const files = [...(event.currentTarget.files ?? [])];
            event.currentTarget.value = "";
            void onUpload(files);
          }}
        />
      </div>

      {error || copyError ? (
        <div className="alert alert-error mt-4 text-sm" role="alert">
          <span>{error ?? copyError}</span>
        </div>
      ) : null}

      {attachments.length === 0 ? (
        <div className="mt-4 rounded-box border border-dashed border-base-300 bg-base-100/60 px-4 py-7 text-center">
          <FileTextIcon className="mx-auto size-6 text-base-content/35" />
          <p className="muted mt-2 text-sm">No files attached.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {attachments.map((attachment) => (
            <li
              className="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3"
              key={attachment.storageId}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-field bg-base-200">
                <FileTextIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {attachment.name}
                </p>
                <p className="mt-0.5 truncate font-mono text-[0.65rem] text-base-content/45">
                  {attachment.contentType ?? "Stored file"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {attachment.url ? (
                  <>
                    <a
                      aria-label={`Open ${attachment.name}`}
                      className="btn btn-ghost btn-square btn-sm"
                      href={attachment.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLinkIcon className="size-4" />
                    </a>
                    <button
                      aria-label={`Copy URL for ${attachment.name}`}
                      className="btn btn-ghost btn-square btn-sm"
                      type="button"
                      onClick={() => void copyAttachmentUrl(attachment)}
                    >
                      {copiedStorageId === attachment.storageId ? (
                        <CheckIcon className="size-4 text-success" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </button>
                  </>
                ) : null}
                <button
                  aria-label={`Remove ${attachment.name}`}
                  className="btn btn-ghost btn-square btn-sm text-error"
                  disabled={isUploading}
                  type="button"
                  onClick={() => void onRemove(attachment.storageId)}
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
