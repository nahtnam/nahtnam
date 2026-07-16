import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { useMutation } from "convex/react";
import { FolderIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import type { BlogCategory, BlogPost, WorkspaceNotice } from "../-lib";
import { errorMessage, formError } from "../-lib";
import { AdminDialog } from "../../-components/admin-dialog";

const categorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(1, "Enter a category name.")
    .max(80, "Keep the category name under 80 characters."),
});

const CategoryFormModel = createForm(categorySchema).configure({
  fields: {
    categoryName: {
      label: "Category name",
      placeholder: "Software",
    },
  },
});

type CategoryEditor =
  | { category: BlogCategory; kind: "edit" }
  | { kind: "create" };

type CategorySectionProps = {
  categories: readonly BlogCategory[];
  onNotice: (notice: WorkspaceNotice) => void;
  posts: readonly BlogPost[];
};

export function CategorySection(props: CategorySectionProps) {
  const { categories, onNotice, posts } = props;
  const deleteCategory = useMutation(api.admin.blog.deleteCategory);
  const [deletingId, setDeletingId] = useState<Id<"blogCategories">>();
  const [editor, setEditor] = useState<CategoryEditor>();

  async function handleDelete(category: BlogCategory) {
    try {
      await deleteCategory({ id: category._id });
      setDeletingId(undefined);
      onNotice({
        kind: "success",
        message: `Deleted the “${category.name}” category.`,
      });
    } catch (error) {
      onNotice({
        kind: "error",
        message: errorMessage({
          error,
          fallback:
            "The category could not be deleted. Reassign its posts first.",
        }),
      });
    }
  }

  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" id="categories-heading">
            Categories
          </h2>
          <p className="muted mt-1 text-sm">
            Organize public posts without changing their Markdown source.
          </p>
        </div>
        <button
          className="btn btn-sm"
          type="button"
          onClick={() => setEditor({ kind: "create" })}
        >
          <PlusIcon className="size-4" /> Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card card-dash bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <FolderIcon className="size-8 text-base-content/30" />
            <h3 className="card-title">No categories yet</h3>
            <p className="muted">Add one before creating your first post.</p>
          </div>
        </div>
      ) : (
        <ul className="list overflow-hidden rounded-box border border-base-300 bg-base-100">
          {categories.map((category) => {
            const postCount = posts.filter(
              (post) => post.categoryId === category._id
            ).length;
            const isDeleting = deletingId === category._id;

            return (
              <li
                key={category._id}
                className="list-row items-center gap-4 border-b border-base-300 last:border-b-0"
              >
                <span className="grid size-10 place-items-center rounded-box bg-base-200">
                  <FolderIcon className="size-4" />
                </span>
                <div className="list-col-grow min-w-0">
                  <p className="font-medium">{category.name}</p>
                  <p className="muted mt-1 text-sm">
                    {postCount} post{postCount === 1 ? "" : "s"}
                  </p>
                </div>

                {isDeleting ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="text-sm text-error">Delete?</span>
                    <button
                      className="btn btn-ghost btn-xs"
                      type="button"
                      onClick={() => setDeletingId(undefined)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-error btn-xs"
                      type="button"
                      onClick={() => handleDelete(category)}
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-1">
                    <button
                      aria-label={`Edit ${category.name}`}
                      className="btn btn-ghost btn-square btn-sm"
                      type="button"
                      onClick={() => setEditor({ category, kind: "edit" })}
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      aria-label={`Delete ${category.name}`}
                      className="btn btn-ghost btn-square btn-sm text-error"
                      type="button"
                      onClick={() => setDeletingId(category._id)}
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <AdminDialog
        description="Categories appear as labels on the blog index and post metadata."
        isOpen={Boolean(editor)}
        title={editor?.kind === "edit" ? "Edit category" : "Add category"}
        onClose={() => setEditor(undefined)}
      >
        {editor ? (
          <CategoryEditorForm
            key={editor.kind === "edit" ? editor.category._id : "new"}
            category={editor.kind === "edit" ? editor.category : undefined}
            onDone={() => setEditor(undefined)}
            onNotice={onNotice}
          />
        ) : null}
      </AdminDialog>
    </section>
  );
}

type CategoryEditorFormProps = {
  category?: BlogCategory;
  onDone: () => void;
  onNotice: (notice: WorkspaceNotice) => void;
};

function CategoryEditorForm(props: CategoryEditorFormProps) {
  const { category, onDone, onNotice } = props;
  const createCategory = useMutation(api.admin.blog.createCategory);
  const updateCategory = useMutation(api.admin.blog.updateCategory);

  return (
    <CategoryFormModel.Form
      defaultValues={{ categoryName: category?.name ?? "" }}
      submitLabel={category ? "Save category" : "Add category"}
      onSubmit={async (values) => {
        try {
          await (category
            ? updateCategory({
                id: category._id,
                name: values.categoryName,
              })
            : createCategory({ name: values.categoryName }));
          onNotice({
            kind: "success",
            message: category ? "Saved the category." : "Added the category.",
          });
          onDone();
          return { status: "success" as const };
        } catch (error) {
          return formError({
            error,
            fallback: "The category could not be saved.",
          });
        }
      }}
    />
  );
}
