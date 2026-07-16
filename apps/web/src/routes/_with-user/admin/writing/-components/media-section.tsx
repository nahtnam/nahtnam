/* oxlint-disable react-doctor/nextjs-no-img-element */
import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { useMutation } from "convex/react";
import { CopyIcon, FileImageIcon, ImagePlusIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import type { BlogMedia, BlogPost, WorkspaceNotice } from "../-lib";
import { copyText, errorMessage, formError, markdownForMedia } from "../-lib";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const mediaUploadSchema = z.object({
  postId: z.string().optional(),
  uploadFile: z
    .file("Choose an image.")
    .refine((file) => file.type.startsWith("image/"), "Choose an image file.")
    .refine(
      (file) => file.size <= MAX_IMAGE_BYTES,
      "Choose an image smaller than 10 MB."
    ),
});

const MediaUploadForm = createForm(mediaUploadSchema).configure({
  fields: {
    postId: {
      control: "select",
      description: "Optional. Attach the image lifecycle to a post.",
      label: "Related post",
      placeholder: "No related post",
    },
    uploadFile: {
      control: "file",
      controlProps: { accept: "image/*" },
      label: "Image",
    },
  },
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type MediaSectionProps = {
  media: readonly BlogMedia[];
  onNotice: (notice: WorkspaceNotice) => void;
  posts: readonly BlogPost[];
};

export function MediaSection(props: MediaSectionProps) {
  const { media, onNotice, posts } = props;
  const generateUploadUrl = useMutation(api.admin.blog.generateUploadUrl);
  const createMedia = useMutation(api.admin.blog.createMedia);
  const [uploadedMarkdown, setUploadedMarkdown] = useState("");

  return (
    <section aria-labelledby="media-heading">
      <div className="mb-5">
        <h2 className="text-xl font-semibold" id="media-heading">
          Media library
        </h2>
        <p className="muted mt-1 text-sm">
          Upload an image, then paste its generated Markdown into a repo-owned
          post file.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
        <aside className="card card-border h-fit bg-base-100">
          <div className="card-body gap-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-box bg-base-200">
                <ImagePlusIcon className="size-4" />
              </span>
              <div>
                <h3 className="card-title">Upload image</h3>
                <p className="muted mt-1 text-sm">
                  PNG, JPEG, GIF, WebP, or another browser-supported image.
                </p>
              </div>
            </div>

            <MediaUploadForm.Form
              className="space-y-5"
              defaultValues={{ postId: "" }}
              resetOnSuccess
              submitLabel="Upload image"
              onSubmit={async (values) => {
                try {
                  const uploadUrl = await generateUploadUrl({});
                  const response = await fetch(uploadUrl, {
                    body: values.uploadFile,
                    headers: { "Content-Type": values.uploadFile.type },
                    method: "POST",
                  });
                  if (!response.ok) {
                    throw new Error(
                      "The image upload failed before it reached storage."
                    );
                  }

                  const payload = (await response.json()) as {
                    storageId?: string;
                  };
                  if (!payload.storageId) {
                    throw new Error(
                      "Storage did not return an image identifier."
                    );
                  }

                  const result = await createMedia({
                    contentType: values.uploadFile.type || undefined,
                    name: values.uploadFile.name,
                    postId: values.postId
                      ? (values.postId as Id<"blogPosts">)
                      : undefined,
                    storageId: payload.storageId as Id<"_storage">,
                  });
                  setUploadedMarkdown(result.markdown);

                  if (result.markdown) {
                    await copyText({ value: result.markdown });
                  }
                  onNotice({
                    kind: "success",
                    message: "Uploaded the image and copied its Markdown.",
                  });
                  return {
                    message: "Image uploaded.",
                    status: "success" as const,
                  };
                } catch (error) {
                  return formError({
                    error,
                    fallback: "The image could not be uploaded.",
                  });
                }
              }}
            >
              <MediaUploadForm.Field name="uploadFile" />
              <MediaUploadForm.Field
                name="postId"
                options={posts.map((post) => ({
                  label: post.title,
                  value: post._id,
                }))}
              />
              <MediaUploadForm.Submit />
            </MediaUploadForm.Form>

            {uploadedMarkdown ? (
              <div className="join w-full">
                <input
                  readOnly
                  aria-label="Uploaded image Markdown"
                  className="input join-item min-w-0 grow font-mono text-xs"
                  value={uploadedMarkdown}
                />
                <button
                  aria-label="Copy uploaded image Markdown"
                  className="btn join-item"
                  type="button"
                  onClick={() =>
                    handleCopy({
                      markdown: uploadedMarkdown,
                      onNotice,
                    })
                  }
                >
                  <CopyIcon className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        </aside>

        <div>
          {media.length === 0 ? (
            <div className="card card-dash bg-base-100">
              <div className="card-body items-center py-14 text-center">
                <FileImageIcon className="size-8 text-base-content/30" />
                <h3 className="card-title">No media yet</h3>
                <p className="muted">Your newest uploads will appear here.</p>
              </div>
            </div>
          ) : (
            <ul className="list overflow-hidden rounded-box border border-base-300 bg-base-100">
              {media.map((item) => {
                const markdown = markdownForMedia(item);
                const relatedPost = item.postId
                  ? posts.find((post) => post._id === item.postId)
                  : undefined;

                return (
                  <li
                    key={item._id}
                    className="list-row items-center gap-4 border-b border-base-300 last:border-b-0"
                  >
                    <div className="avatar">
                      <div className="size-14 rounded-box border border-base-300 bg-base-200">
                        {item.url ? (
                          <img
                            alt={item.name}
                            className="object-cover"
                            src={item.url}
                          />
                        ) : (
                          <span className="grid size-full place-items-center">
                            <FileImageIcon className="size-5 text-base-content/35" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="list-col-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{item.name}</p>
                        {relatedPost ? (
                          <span className="badge badge-ghost badge-sm">
                            {relatedPost.title}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-xs text-base-content/45">
                        {item.contentType ?? "unknown type"} ·{" "}
                        {dateTimeFormatter.format(item.createdAt)}
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-base-content/40">
                        {item.url ?? "Public URL unavailable"}
                      </p>
                    </div>
                    <button
                      aria-label={`Copy Markdown for ${item.name}`}
                      className="btn btn-ghost btn-square btn-sm"
                      disabled={!markdown}
                      type="button"
                      onClick={() => handleCopy({ markdown, onNotice })}
                    >
                      <CopyIcon className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

async function handleCopy(options: {
  markdown: string;
  onNotice: (notice: WorkspaceNotice) => void;
}) {
  const { markdown, onNotice } = options;

  try {
    await copyText({ value: markdown });
    onNotice({ kind: "success", message: "Copied image Markdown." });
  } catch (error) {
    onNotice({
      kind: "error",
      message: errorMessage({
        error,
        fallback: "The Markdown could not be copied.",
      }),
    });
  }
}
