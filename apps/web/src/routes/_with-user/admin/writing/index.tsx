import { api } from "@repo/backend/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createConvexRouteQueries } from "convex-route-query";
import {
  FileImageIcon,
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { AdminPageHeader } from "../-components/admin-page-header";
import { CategorySection } from "./-components/category-section";
import { MediaSection } from "./-components/media-section";
import { PostEditor, PostsSection } from "./-components/post-section";
import type { WorkspaceNotice } from "./-lib";
import { toLocalDateTime } from "./-lib";

type WritingSection = "categories" | "media" | "posts";

const { listAllPosts, listCategories, listMedia } = createConvexRouteQueries({
  listAllPosts: api.admin.blog.listAllPosts,
  listCategories: api.admin.blog.listCategories,
  listMedia: api.admin.blog.listMedia,
});

const writingSearchSchema = z.object({
  post: z.string().optional(),
  section: z.enum(["categories", "media", "posts"]).optional(),
});

export const Route = createFileRoute("/_with-user/admin/writing/")({
  component: WritingAdminPage,
  validateSearch: writingSearchSchema,
  async loader(context) {
    const [postsRouteData, categoriesRouteData, mediaRouteData] =
      await Promise.all([
        listAllPosts.prefetchRoute(context, {}),
        listCategories.prefetchRoute(context, {}),
        listMedia.prefetchRoute(context, {}),
      ]);

    return {
      ...categoriesRouteData,
      initialPublishedAt: Date.now(),
      ...mediaRouteData,
      ...postsRouteData,
    };
  },
});

const sectionMeta = [
  { icon: FileTextIcon, id: "posts", label: "Posts" },
  { icon: FolderIcon, id: "categories", label: "Categories" },
  { icon: FileImageIcon, id: "media", label: "Media" },
] as const;

function WritingAdminPage() {
  const { data: posts } = listAllPosts.useSuspenseRouteQuery(Route);
  const { data: categories } = listCategories.useSuspenseRouteQuery(Route);
  const { data: media } = listMedia.useSuspenseRouteQuery(Route);
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const { initialPublishedAt } = Route.useLoaderData();
  const [notice, setNotice] = useState<WorkspaceNotice | null>(null);
  const [newPostPublishedAt, setNewPostPublishedAt] = useState(() =>
    toLocalDateTime(new Date(initialPublishedAt))
  );
  const section: WritingSection = search.section ?? "posts";
  const editorPost =
    search.post && search.post !== "new"
      ? posts.find((post) => post._id === search.post)
      : undefined;
  const isEditorOpen = search.post === "new" || Boolean(editorPost);
  const publishedCount = posts.filter((post) => post.published).length;
  const xPostCount = posts.filter(
    (post) => (post.kind ?? "markdown") === "x"
  ).length;
  const counts: Record<WritingSection, number> = {
    categories: categories.length,
    media: media.length,
    posts: posts.length,
  };

  function handleNewPost() {
    setNewPostPublishedAt(toLocalDateTime(new Date()));
    void navigate({
      search: (previous: z.infer<typeof writingSearchSchema>) => ({
        ...previous,
        post: "new",
      }),
    });
  }

  return (
    <div>
      <AdminPageHeader
        actions={
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleNewPost}
          >
            <PlusIcon className="size-4" /> New post
          </button>
        }
        description="Move drafts, X threads, categories, and media through one focused publishing queue."
        eyebrow="Publishing desk"
        title="Writing"
      />

      <div className="mb-7 grid gap-px overflow-hidden rounded-box border border-base-300 bg-base-300 sm:grid-cols-3">
        <PublishingSignal label="Live" value={`${publishedCount} published`} />
        <PublishingSignal
          label="Queue"
          value={`${posts.length - publishedCount} drafts`}
        />
        <PublishingSignal label="Format" value={`${xPostCount} X threads`} />
      </div>

      {notice ? (
        <WorkspaceAlert notice={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      <div className="tabs tabs-border mb-7" role="tablist">
        {sectionMeta.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`tab gap-2 ${section === item.id ? "tab-active" : ""}`}
              role="tab"
              type="button"
              onClick={() =>
                void navigate({
                  search: (previous: z.infer<typeof writingSearchSchema>) => ({
                    ...previous,
                    section: item.id,
                  }),
                })
              }
            >
              <Icon className="size-4" />
              {item.label}
              <span className="badge badge-sm badge-ghost">
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      {section === "posts" ? (
        <PostsSection
          posts={posts}
          onEdit={(post) =>
            void navigate({
              search: (previous: z.infer<typeof writingSearchSchema>) => ({
                ...previous,
                post: post._id,
              }),
            })
          }
          onNotice={setNotice}
        />
      ) : null}
      {section === "categories" ? (
        <CategorySection
          categories={categories}
          posts={posts}
          onNotice={setNotice}
        />
      ) : null}
      {section === "media" ? (
        <MediaSection media={media} posts={posts} onNotice={setNotice} />
      ) : null}

      <PostEditor
        categories={categories}
        isOpen={isEditorOpen}
        media={media}
        newPostPublishedAt={newPostPublishedAt}
        post={editorPost}
        onClose={() =>
          void navigate({
            replace: true,
            search: removePostSearch,
          })
        }
        onNotice={setNotice}
      />
    </div>
  );
}

type PublishingSignalProps = {
  label: string;
  value: string;
};

function PublishingSignal(props: PublishingSignalProps) {
  const { label, value } = props;

  return (
    <div className="flex items-center justify-between gap-4 bg-base-100 px-5 py-4 sm:block">
      <p className="font-mono text-xs tracking-[0.16em] text-base-content/45 uppercase">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

type WorkspaceAlertProps = {
  notice: WorkspaceNotice;
  onDismiss: () => void;
};

function WorkspaceAlert(props: WorkspaceAlertProps) {
  const { notice, onDismiss } = props;
  const colorClass = noticeColorClass(notice.kind);

  return (
    <div
      className={`alert alert-soft mb-6 ${colorClass}`}
      role={notice.kind === "error" ? "alert" : "status"}
    >
      <span>{notice.message}</span>
      <button
        aria-label="Dismiss message"
        className="btn btn-ghost btn-circle btn-sm"
        type="button"
        onClick={onDismiss}
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

function noticeColorClass(kind: WorkspaceNotice["kind"]) {
  if (kind === "error") {
    return "alert-error";
  }
  if (kind === "success") {
    return "alert-success";
  }
  return "alert-info";
}

function removePostSearch(search: z.infer<typeof writingSearchSchema>) {
  const remainingSearch = { ...search };
  delete remainingSearch.post;

  return remainingSearch;
}
