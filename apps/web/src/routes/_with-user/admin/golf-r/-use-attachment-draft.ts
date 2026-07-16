import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { useMutation } from "convex/react";
import { useEffect, useReducer, useRef } from "react";

import type { AttachmentValue, GolfRItem } from "./-types";

type AttachmentDraftState = {
  attachments: AttachmentValue[];
  error: string | null;
  isUploading: boolean;
};

type AttachmentDraftAction =
  | { attachment: AttachmentValue; type: "add" }
  | { error: string | null; type: "error" }
  | { storageId: Id<"_storage">; type: "remove" }
  | { type: "resolve-urls"; urls: Map<Id<"_storage">, string> }
  | { isUploading: boolean; type: "uploading" };

export function useAttachmentDraft(item?: GolfRItem) {
  const deleteAttachment = useMutation(api.admin.golf_r.deleteAttachment);
  const generateUploadUrl = useMutation(api.admin.golf_r.generateUploadUrl);
  const getAttachmentUrl = useMutation(api.admin.golf_r.getAttachmentUrl);
  const [state, dispatch] = useReducer(
    attachmentDraftReducer,
    item,
    createInitialState
  );
  const isActiveRef = useRef(true);
  const isCommittedRef = useRef(false);
  const newAttachmentIdsRef = useRef(new Set<Id<"_storage">>());
  const deleteAttachmentRef = useRef(deleteAttachment);

  useEffect(() => {
    deleteAttachmentRef.current = deleteAttachment;
  }, [deleteAttachment]);

  useEffect(() => {
    isActiveRef.current = true;
    const newAttachmentIds = newAttachmentIdsRef.current;

    return () => {
      isActiveRef.current = false;

      if (!isCommittedRef.current) {
        const storageIds = [...newAttachmentIds];
        void Promise.allSettled(
          storageIds.map((storageId) =>
            deleteAttachmentRef.current({ storageId })
          )
        );
      }
    };
  }, []);

  useEffect(() => {
    const baseAttachments = item?.attachments ?? [];

    if (baseAttachments.length === 0) {
      return;
    }

    let isCurrent = true;

    async function resolveUrls() {
      const urlEntries = await Promise.all(
        baseAttachments.map(async (attachment) => {
          try {
            const url = await getAttachmentUrl({
              storageId: attachment.storageId,
            });

            return url ? ([attachment.storageId, url] as const) : null;
          } catch {
            return null;
          }
        })
      );

      if (!isCurrent) {
        return;
      }

      const urls = new Map<Id<"_storage">, string>();
      for (const entry of urlEntries) {
        if (entry) {
          urls.set(...entry);
        }
      }
      dispatch({ type: "resolve-urls", urls });
    }

    void resolveUrls();

    return () => {
      isCurrent = false;
    };
  }, [getAttachmentUrl, item]);

  async function handleUploadFile(file: File) {
    try {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}.`);
      }

      const storageId = storageIdFromResponse(await response.json());
      newAttachmentIdsRef.current.add(storageId);

      if (!isActiveRef.current) {
        await Promise.allSettled([deleteAttachment({ storageId })]);
        return null;
      }

      let url: string | null = null;
      try {
        url = await getAttachmentUrl({ storageId });
      } catch {
        url = null;
      }

      if (!isActiveRef.current) {
        await Promise.allSettled([deleteAttachment({ storageId })]);
        return null;
      }

      const attachment: AttachmentValue = {
        ...(file.type ? { contentType: file.type } : {}),
        name: file.name,
        storageId,
        ...(url ? { url } : {}),
      };
      dispatch({ attachment, type: "add" });
      return null;
    } catch {
      return file.name;
    }
  }

  async function handleUploadFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    dispatch({ error: null, type: "error" });
    dispatch({ isUploading: true, type: "uploading" });
    const uploadResults = await Promise.all(files.map(handleUploadFile));
    const failedFiles = uploadResults.filter(
      (fileName): fileName is string => fileName !== null
    );

    if (isActiveRef.current) {
      dispatch({ isUploading: false, type: "uploading" });
      dispatch({
        error:
          failedFiles.length > 0
            ? `Could not upload: ${failedFiles.join(", ")}.`
            : null,
        type: "error",
      });
    }
  }

  async function handleRemoveAttachment(storageId: Id<"_storage">) {
    dispatch({ error: null, type: "error" });

    if (newAttachmentIdsRef.current.has(storageId)) {
      try {
        await deleteAttachment({ storageId });
        newAttachmentIdsRef.current.delete(storageId);
      } catch {
        dispatch({
          error: "The new attachment could not be removed from storage.",
          type: "error",
        });
        return;
      }
    }

    dispatch({ storageId, type: "remove" });
  }

  function markCommitted() {
    isCommittedRef.current = true;
    newAttachmentIdsRef.current.clear();
  }

  return {
    ...state,
    handleRemoveAttachment,
    handleUploadFiles,
    markCommitted,
  };
}

function createInitialState(item?: GolfRItem): AttachmentDraftState {
  return {
    attachments: (item?.attachments ?? []).map((attachment) => ({
      ...attachment,
    })),
    error: null,
    isUploading: false,
  };
}

function attachmentDraftReducer(
  state: AttachmentDraftState,
  action: AttachmentDraftAction
): AttachmentDraftState {
  switch (action.type) {
    case "add": {
      return {
        ...state,
        attachments: [...state.attachments, action.attachment],
      };
    }
    case "error": {
      return { ...state, error: action.error };
    }
    case "remove": {
      return {
        ...state,
        attachments: state.attachments.filter(
          (attachment) => attachment.storageId !== action.storageId
        ),
      };
    }
    case "resolve-urls": {
      return {
        ...state,
        attachments: state.attachments.map((attachment) => {
          const url = action.urls.get(attachment.storageId);
          return url ? { ...attachment, url } : attachment;
        }),
      };
    }
    case "uploading": {
      return { ...state, isUploading: action.isUploading };
    }
    default: {
      return state;
    }
  }
}

function storageIdFromResponse(value: unknown): Id<"_storage"> {
  if (
    typeof value !== "object" ||
    value === null ||
    !("storageId" in value) ||
    typeof value.storageId !== "string"
  ) {
    throw new Error("The upload response did not include a storage ID.");
  }

  return value.storageId as Id<"_storage">;
}
