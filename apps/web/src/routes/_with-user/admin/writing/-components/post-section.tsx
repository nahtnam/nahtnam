import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { useAction, useMutation } from "convex/react";
import {
  ArrowUpRightIcon,
  CopyIcon,
  FileTextIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  PencilIcon,
  RefreshCcwIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, RefObject } from "react";
import Markdown from "react-markdown";
import { z } from "zod";

import {
  availableBlogContentPaths,
  getBlogMarkdownContent,
} from "@/lib/blog/markdown";

import type {
  BlogCategory,
  BlogMedia,
  BlogPost,
  WorkspaceNotice,
} from "../-lib";
import {
  copyText,
  errorMessage,
  formError,
  markdownForMedia,
  toLocalDateTime,
} from "../-lib";

const postSchema = z
  .object({
    categoryId: z.string().min(1, "Choose a category."),
    contentPath: z.string().trim(),
    excerpt: z
      .string()
      .trim()
      .max(500, "Keep the excerpt under 500 characters."),
    kind: z.enum(["markdown", "x"]),
    published: z.boolean(),
    publishedAt: z
      .string()
      .min(1, "Choose a publication date.")
      .refine((value) => Number.isFinite(new Date(value).getTime()), {
        message: "Choose a valid publication date.",
      }),
    slug: z.string().trim().max(120, "Keep the slug under 120 characters."),
    title: z.string().trim().max(160, "Keep the title under 160 characters."),
    tweetInput: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (values.kind === "x") {
      if (!values.tweetInput) {
        context.addIssue({
          code: "custom",
          message: "Enter at least one tweet URL or ID.",
          path: ["tweetInput"],
        });
      }
      return;
    }

    for (const field of ["contentPath", "excerpt", "slug", "title"] as const) {
      if (!values[field]) {
        context.addIssue({
          code: "custom",
          message: "This field is required for a Markdown post.",
          path: [field],
        });
      }
    }
  });

const PostFormModel = createForm(postSchema).configure({
  fields: {
    categoryId: {
      control: "select",
      label: "Category",
      placeholder: "Choose a category",
    },
    contentPath: {
      controlProps: { list: "blog-content-paths" },
      description: "A bundled file under apps/web/content/blog.",
      label: "Markdown file",
      placeholder: "content/blog/example.md",
    },
    excerpt: {
      control: "textarea",
      controlProps: { rows: 3 },
      label: "Excerpt",
      placeholder: "A concise summary for the blog index and social cards.",
    },
    kind: {
      control: "select",
      label: "Format",
      options: [
        { label: "Markdown", value: "markdown" },
        { label: "X thread", value: "x" },
      ],
    },
    published: {
      control: "checkbox",
      description: "When off, the post stays in the draft queue.",
      label: "Published",
    },
    publishedAt: {
      control: "datetime-local",
      label: "Publication date",
    },
    slug: {
      description: "Public path under /blog/.",
      label: "Slug",
      placeholder: "my-post",
    },
    title: { label: "Title" },
    tweetInput: {
      control: "textarea",
      controlProps: { className: "min-h-36 font-mono text-sm" },
      description:
        "One final tweet URL imports its whole thread. Multiple URLs preserve the order entered.",
      label: "Tweet URLs or IDs",
      placeholder: "https://x.com/nahtnam/status/…",
    },
  },
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const createPostLabel = "Create post";
const REFRESH_X_ERROR_MESSAGE = "The X thread could not be refreshed.";

type PostsSectionProps = {
  onEdit: (post: BlogPost) => void;
  onNotice: (notice: WorkspaceNotice) => void;
  posts: readonly BlogPost[];
};

export function PostsSection(props: PostsSectionProps) {
  const { onEdit, onNotice, posts } = props;
  const refreshXPost = useAction(api.admin.blog.refreshXPost);
  const [refreshingId, setRefreshingId] = useState<Id<"blogPosts">>();

  async function handleRefresh(post: BlogPost) {
    setRefreshingId(post._id);
    try {
      await refreshXPost({ id: post._id });
      onNotice({ kind: "success", message: `Refreshed “${post.title}”.` });
    } catch (error) {
      onNotice({
        kind: "error",
        message: errorMessage({
          error,
          fallback: REFRESH_X_ERROR_MESSAGE,
        }),
      });
    } finally {
      setRefreshingId(undefined);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="card card-dash bg-base-100">
        <div className="card-body items-center py-14 text-center">
          <FileTextIcon className="size-8 text-base-content/35" />
          <h2 className="card-title">No posts yet</h2>
          <p className="muted">Create a Markdown post or import an X thread.</p>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="post-queue-heading">
      <div className="mb-4">
        <h2 className="text-xl font-semibold" id="post-queue-heading">
          Publishing queue
        </h2>
        <p className="muted mt-1 text-sm">
          Newest publication date first. Future dates remain scheduled.
        </p>
      </div>

      <ul className="list overflow-hidden rounded-box border border-base-300 bg-base-100">
        {posts.map((post) => {
          const kind = post.kind ?? "markdown";

          return (
            <li
              key={post._id}
              className="list-row grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-base-300 p-5 last:border-b-0 md:grid-cols-[minmax(0,1.5fr)_minmax(12rem,0.65fr)_auto]"
            >
              <div className="list-col-grow min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      post.published
                        ? "badge badge-success badge-soft badge-sm"
                        : "badge badge-ghost badge-sm"
                    }
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="badge badge-outline badge-sm">
                    {kind === "x" ? "X thread" : "Markdown"}
                  </span>
                  <span className="badge badge-ghost badge-sm">
                    {post.category.name}
                  </span>
                </div>
                <h3 className="mt-3 truncate font-semibold">{post.title}</h3>
                <p className="mt-1 truncate font-mono text-xs text-base-content/50">
                  /blog/{post.slug}
                </p>
              </div>

              <div className="hidden self-center md:block">
                <p className="font-mono text-xs text-base-content/45 uppercase">
                  Publish date
                </p>
                <p className="mt-1 text-sm">
                  {dateFormatter.format(post.publishedAt)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 self-center">
                {post.published ? (
                  <a
                    aria-label={`View ${post.title}`}
                    className="btn btn-ghost btn-square btn-sm"
                    href={`/blog/${post.slug}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ArrowUpRightIcon className="size-4" />
                  </a>
                ) : null}
                {kind === "x" ? (
                  <button
                    aria-label={`Refresh ${post.title}`}
                    className="btn btn-ghost btn-square btn-sm"
                    disabled={Boolean(refreshingId)}
                    type="button"
                    onClick={() => handleRefresh(post)}
                  >
                    <RefreshCcwIcon
                      className={`size-4 ${refreshingId === post._id ? "animate-spin" : ""}`}
                    />
                  </button>
                ) : null}
                <button
                  aria-label={`Edit ${post.title}`}
                  className="btn btn-ghost btn-square btn-sm"
                  type="button"
                  onClick={() => onEdit(post)}
                >
                  <PencilIcon className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type PostEditorProps = {
  categories: readonly BlogCategory[];
  isOpen: boolean;
  media: readonly BlogMedia[];
  newPostPublishedAt: string;
  onClose: () => void;
  onNotice: (notice: WorkspaceNotice) => void;
  post?: BlogPost;
};

export function PostEditor(props: PostEditorProps) {
  const {
    categories,
    isOpen,
    media,
    newPostPublishedAt,
    onClose,
    onNotice,
    post,
  } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="post-editor-title"
      className="modal"
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="modal-box max-h-[92vh] max-w-6xl overflow-y-auto border border-base-300 bg-base-100 p-0">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-300 bg-base-100 px-6 py-5 sm:px-8">
          <div>
            <p className="route-kicker">{post ? "Edit entry" : "New entry"}</p>
            <h2 className="heading mt-2 text-3xl" id="post-editor-title">
              {post ? post.title : createPostLabel}
            </h2>
          </div>
          <form method="dialog">
            <button
              aria-label="Close post editor"
              className="btn btn-ghost btn-circle btn-sm"
              type="submit"
            >
              <XIcon className="size-4" />
            </button>
          </form>
        </header>

        {isOpen ? (
          <PostForm
            key={post?._id ?? "new"}
            categories={categories}
            media={media}
            newPostPublishedAt={newPostPublishedAt}
            post={post}
            onDone={onClose}
            onNotice={onNotice}
          />
        ) : null}
      </div>
      <form className="modal-backdrop" method="dialog">
        <button type="submit">Close</button>
      </form>
    </dialog>
  );
}

type PostFormProps = {
  categories: readonly BlogCategory[];
  media: readonly BlogMedia[];
  newPostPublishedAt: string;
  onDone: () => void;
  onNotice: (notice: WorkspaceNotice) => void;
  post?: BlogPost;
};

function PostForm(props: PostFormProps) {
  const { categories, media, newPostPublishedAt, onDone, onNotice, post } =
    props;
  const createPost = useMutation(api.admin.blog.createPost);
  const updatePost = useMutation(api.admin.blog.updatePost);
  const deletePost = useMutation(api.admin.blog.deletePost);
  const generateUploadUrl = useMutation(api.admin.blog.generateUploadUrl);
  const createMedia = useMutation(api.admin.blog.createMedia);
  const saveImportedXPost = useAction(api.admin.blog.saveImportedXPost);
  const refreshXPost = useAction(api.admin.blog.refreshXPost);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [uploadedMarkdown, setUploadedMarkdown] = useState("");
  const [uploading, setUploading] = useState(false);
  const defaultContentPath =
    post?.contentPath ?? (post?.slug ? `content/blog/${post.slug}.md` : "");

  async function handleDelete() {
    if (!post) {
      return;
    }

    try {
      await deletePost({ id: post._id });
      onNotice({ kind: "success", message: `Deleted “${post.title}”.` });
      onDone();
    } catch (error) {
      setLocalError(
        errorMessage({ error, fallback: "The post could not be deleted." })
      );
    }
  }

  async function handleRefresh() {
    if (!post) {
      return;
    }

    setRefreshing(true);
    setLocalError(undefined);
    try {
      await refreshXPost({ id: post._id });
      onNotice({ kind: "success", message: `Refreshed “${post.title}”.` });
    } catch (error) {
      setLocalError(
        errorMessage({
          error,
          fallback: REFRESH_X_ERROR_MESSAGE,
        })
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLocalError("Choose an image file.");
      return;
    }

    setUploading(true);
    setLocalError(undefined);
    try {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("The image upload failed before it reached storage.");
      }

      const payload = (await response.json()) as { storageId?: string };
      if (!payload.storageId) {
        throw new Error("Storage did not return an image identifier.");
      }

      const result = await createMedia({
        contentType: file.type || undefined,
        name: file.name,
        postId: post?._id,
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
    } catch (error) {
      setLocalError(
        errorMessage({ error, fallback: "The image could not be uploaded." })
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(values: z.infer<typeof postSchema>) {
    setLocalError(undefined);
    const publishedAt = new Date(values.publishedAt).getTime();

    try {
      if (values.kind === "x") {
        await saveImportedXPost({
          categoryId: values.categoryId as Id<"blogCategories">,
          excerpt: values.excerpt || undefined,
          id: post?._id,
          published: values.published,
          publishedAt,
          slug: values.slug || undefined,
          title: values.title || undefined,
          tweetInput: values.tweetInput,
        });
      } else {
        const postData = {
          categoryId: values.categoryId as Id<"blogCategories">,
          contentPath: values.contentPath,
          excerpt: values.excerpt,
          published: values.published,
          publishedAt,
          slug: values.slug,
          title: values.title,
        };

        await (post
          ? updatePost({ id: post._id, ...postData })
          : createPost(postData));
      }

      onNotice({
        kind: "success",
        message: post ? "Saved the post." : "Created the post.",
      });
      onDone();
      return { status: "success" as const };
    } catch (error) {
      return formError({
        error,
        fallback: "The post could not be saved.",
      });
    }
  }

  return (
    <PostFormModel.Form
      className="space-y-7 p-6 sm:p-8"
      defaultValues={postDefaultValues({
        categories,
        defaultContentPath,
        newPostPublishedAt,
        post,
      })}
      submitLabel={post ? "Save changes" : createPostLabel}
      onSubmit={handleSubmit}
    >
      <PostFormAlerts
        hasCategories={categories.length > 0}
        localError={localError}
      />
      <PostMetadataFields categories={categories} />

      <PostFormModel.When field="kind" equals="x">
        <XPostPanel
          post={post}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </PostFormModel.When>

      <PostFormModel.When field="kind" equals="markdown">
        <MarkdownPostPanel
          fileInputRef={fileInputRef}
          media={media}
          onFileChange={handleFileChange}
          onNotice={onNotice}
          uploadedMarkdown={uploadedMarkdown}
          uploading={uploading}
        />
      </PostFormModel.When>

      <PostFormFooter
        confirmingDelete={confirmingDelete}
        hasPost={Boolean(post)}
        onCancel={onDone}
        onConfirmDelete={handleDelete}
        onStartDelete={() => setConfirmingDelete(true)}
        onStopDelete={() => setConfirmingDelete(false)}
        submitLabel={post ? "Save changes" : createPostLabel}
      />
    </PostFormModel.Form>
  );
}

type PostFormAlertsProps = {
  hasCategories: boolean;
  localError: string | undefined;
};

function PostFormAlerts(props: PostFormAlertsProps) {
  const { hasCategories, localError } = props;

  return (
    <>
      {hasCategories ? null : (
        <div className="alert alert-warning alert-soft" role="alert">
          Create a category before saving this post.
        </div>
      )}
      {localError ? (
        <div className="alert alert-error alert-soft" role="alert">
          <span>{localError}</span>
        </div>
      ) : null}
    </>
  );
}

type PostMetadataFieldsProps = {
  categories: readonly BlogCategory[];
};

function PostMetadataFields(props: PostMetadataFieldsProps) {
  const { categories } = props;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)_minmax(16rem,0.75fr)]">
        <PostFormModel.Field name="kind" />
        <PostFormModel.Field name="title" />
        <PostFormModel.Field name="slug" />
      </div>
      <SlugGenerator />
      <PostFormModel.Field name="excerpt" />

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)_12rem]">
        <PostFormModel.Field
          name="categoryId"
          options={categories.map((category) => ({
            label: category.name,
            value: category._id,
          }))}
        />
        <PostFormModel.Field name="publishedAt" />
        <PostFormModel.Field name="published" />
      </div>
    </>
  );
}

type XPostPanelProps = {
  onRefresh: () => Promise<void>;
  post: BlogPost | undefined;
  refreshing: boolean;
};

function XPostPanel(props: XPostPanelProps) {
  const { onRefresh, post, refreshing } = props;

  return (
    <section className="card card-border bg-base-200/45">
      <div className="card-body gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="route-kicker">Thread import</p>
            <p className="muted mt-2 text-sm">
              Importing fetches fresh tweet data before saving.
            </p>
          </div>
          {post ? (
            <button
              className="btn btn-outline btn-sm"
              disabled={refreshing}
              type="button"
              onClick={onRefresh}
            >
              {refreshing ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <RefreshCcwIcon className="size-4" />
              )}
              Refresh cached tweets
            </button>
          ) : null}
        </div>
        <PostFormModel.Field name="tweetInput" />
        {post?.tweetsFetchedAt ? (
          <p className="font-mono text-xs text-base-content/45">
            {post.tweets?.length ?? 0} tweets · refreshed{" "}
            {dateFormatter.format(post.tweetsFetchedAt)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type MarkdownPostPanelProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  media: readonly BlogMedia[];
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onNotice: (notice: WorkspaceNotice) => void;
  uploadedMarkdown: string;
  uploading: boolean;
};

function MarkdownPostPanel(props: MarkdownPostPanelProps) {
  const {
    fileInputRef,
    media,
    onFileChange,
    onNotice,
    uploadedMarkdown,
    uploading,
  } = props;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section className="card card-border bg-base-200/45">
        <div className="card-body gap-5">
          <div>
            <p className="route-kicker">Source & media</p>
            <p className="muted mt-2 text-sm">
              Select a repo-owned Markdown file, then copy image snippets into
              that file.
            </p>
          </div>

          <PostFormModel.Field name="contentPath" />
          <datalist id="blog-content-paths">
            {availableBlogContentPaths.map((contentPath) => (
              <option key={contentPath} value={contentPath}>
                {contentPath}
              </option>
            ))}
          </datalist>

          <input
            ref={fileInputRef}
            aria-label="Choose an image to upload"
            className="hidden"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
          <button
            className="btn btn-outline btn-sm w-fit"
            disabled={uploading}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-4" />
            )}
            Upload image
          </button>

          {uploadedMarkdown ? (
            <CopyableMarkdown markdown={uploadedMarkdown} onNotice={onNotice} />
          ) : null}

          <div className="space-y-2">
            <p className="font-mono text-xs tracking-[0.14em] text-base-content/45 uppercase">
              Recent media
            </p>
            {media.slice(0, 6).map((item) => (
              <MediaCopyRow key={item._id} media={item} onNotice={onNotice} />
            ))}
          </div>
        </div>
      </section>

      <MarkdownPreview />
    </div>
  );
}

type PostFormFooterProps = {
  confirmingDelete: boolean;
  hasPost: boolean;
  onCancel: () => void;
  onConfirmDelete: () => Promise<void>;
  onStartDelete: () => void;
  onStopDelete: () => void;
  submitLabel: string;
};

function PostFormFooter(props: PostFormFooterProps) {
  const {
    confirmingDelete,
    hasPost,
    onCancel,
    onConfirmDelete,
    onStartDelete,
    onStopDelete,
    submitLabel,
  } = props;
  let deleteControl = null;

  if (hasPost && confirmingDelete) {
    deleteControl = (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-error">
          Delete this post and its attached media?
        </span>
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={onStopDelete}
        >
          Cancel
        </button>
        <button
          className="btn btn-error btn-sm"
          type="button"
          onClick={onConfirmDelete}
        >
          Delete permanently
        </button>
      </div>
    );
  } else if (hasPost) {
    deleteControl = (
      <button
        className="btn btn-ghost btn-sm text-error"
        type="button"
        onClick={onStartDelete}
      >
        <Trash2Icon className="size-4" /> Delete post
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300 pt-6">
      <div>{deleteControl}</div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <PostFormModel.Submit>
          <SaveIcon className="size-4" /> {submitLabel}
        </PostFormModel.Submit>
      </div>
    </div>
  );
}

function postDefaultValues(options: {
  categories: readonly BlogCategory[];
  defaultContentPath: string;
  newPostPublishedAt: string;
  post: BlogPost | undefined;
}) {
  const { categories, defaultContentPath, newPostPublishedAt, post } = options;

  return {
    categoryId: post?.categoryId ?? categories[0]?._id ?? "",
    contentPath: defaultContentPath,
    excerpt: post?.excerpt ?? "",
    kind: post?.kind ?? "markdown",
    published: post?.published ?? true,
    publishedAt: post
      ? toLocalDateTime(new Date(post.publishedAt))
      : newPostPublishedAt,
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    tweetInput: post?.tweets?.map((tweet) => tweet.sourceUrl).join("\n") ?? "",
  };
}

function SlugGenerator() {
  const form = PostFormModel.useFormState();
  const title = form.values.title ?? "";

  return (
    <div className="-mt-5 flex justify-end">
      <button
        className="btn btn-ghost btn-xs"
        disabled={!title.trim()}
        type="button"
        onClick={() => form.setValue("slug", slugify({ value: title }))}
      >
        <SparklesIcon className="size-3" /> Generate slug from title
      </button>
    </div>
  );
}

function MarkdownPreview() {
  const contentPath = PostFormModel.useField("contentPath").value;
  const markdown = getBlogMarkdownContent(contentPath);

  return (
    <section className="card card-border min-h-96 bg-base-100">
      <div className="card-body gap-5">
        <div className="flex items-center justify-between gap-3 border-b border-base-300 pb-4">
          <div>
            <p className="route-kicker">Preview</p>
            <p className="muted mt-2 text-sm">
              Rendered from the bundled file.
            </p>
          </div>
          <span className="badge badge-outline">
            {markdown ? "File found" : "Missing file"}
          </span>
        </div>
        {markdown ? (
          <article className="article-prose text-sm">
            <Markdown>{markdown}</Markdown>
          </article>
        ) : (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <FileTextIcon className="mx-auto size-8 text-base-content/30" />
              <p className="mt-3 font-medium">No bundled Markdown found</p>
              <p className="muted mt-1 text-sm">
                Choose a path from the list or add the file to the repo.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type MediaCopyRowProps = {
  media: BlogMedia;
  onNotice: (notice: WorkspaceNotice) => void;
};

function MediaCopyRow(props: MediaCopyRowProps) {
  const { media, onNotice } = props;
  const markdown = markdownForMedia(media);

  return (
    <div className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 p-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{media.name}</p>
        <p className="truncate text-xs text-base-content/45">{media.url}</p>
      </div>
      <button
        aria-label={`Copy Markdown for ${media.name}`}
        className="btn btn-ghost btn-square btn-sm"
        disabled={!markdown}
        type="button"
        onClick={() => handleCopy({ markdown, onNotice })}
      >
        <CopyIcon className="size-4" />
      </button>
    </div>
  );
}

type CopyableMarkdownProps = {
  markdown: string;
  onNotice: (notice: WorkspaceNotice) => void;
};

function CopyableMarkdown(props: CopyableMarkdownProps) {
  const { markdown, onNotice } = props;

  return (
    <div className="join w-full">
      <input
        readOnly
        aria-label="Uploaded image Markdown"
        className="input join-item min-w-0 grow font-mono text-xs"
        value={markdown}
      />
      <button
        aria-label="Copy uploaded image Markdown"
        className="btn join-item"
        type="button"
        onClick={() => handleCopy({ markdown, onNotice })}
      >
        <CopyIcon className="size-4" />
      </button>
    </div>
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

function slugify(options: { value: string }) {
  const { value } = options;

  return value
    .toLowerCase()
    .replaceAll(/[^\w\s-]/gu, "")
    .replaceAll(/\s+/gu, "-")
    .replaceAll(/-+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}
