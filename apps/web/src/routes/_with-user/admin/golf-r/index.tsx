import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { useMutation } from "convex/react";
import { PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { AdminDialog } from "../-components/admin-dialog";
import { AdminPageHeader } from "../-components/admin-page-header";
import { GolfItemEditor } from "./-golf-item-editor";
import { ItemTable } from "./-item-table";
import { categoryLabel, categoryOptions, formatUsd, netCost } from "./-lib";
import type { GolfRItem } from "./-types";

const listItems = createConvexRouteQuery(api.admin.golf_r.listItems);

export const Route = createFileRoute("/_with-user/admin/golf-r/")({
  component: GolfRAdminPage,
  async loader({ context }) {
    await listItems.prefetchQuery(context.queryClient);
  },
});

type Editor = { kind: "create" } | { item: GolfRItem; kind: "edit" };

function GolfRAdminPage() {
  const { data: items } = listItems.useSuspenseQuery();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deletingItem, setDeletingItem] = useState<GolfRItem | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const filteredItems = filterItems({ category, items, search });

  return (
    <div>
      <AdminPageHeader
        actions={
          <button
            className="btn btn-neutral"
            type="button"
            onClick={() => setEditor({ kind: "create" })}
          >
            <PlusIcon className="size-4" />
            Add record
          </button>
        }
        description="Run the ownership ledger: purchase accounting, modifications, service history, odometer notes, and private proof of work."
        eyebrow="Vehicle operations"
        title="Golf R"
      />

      <LedgerStats items={items} />

      <section aria-labelledby="golf-r-ledger-heading" className="mt-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="heading text-2xl" id="golf-r-ledger-heading">
              Build ledger
            </h2>
            <p className="muted mt-1 text-sm">
              Showing {filteredItems.length} of {items.length} records.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="input w-full sm:w-64">
              <SearchIcon className="size-4 text-base-content/40" />
              <input
                aria-label="Search Golf R records"
                placeholder="Search records…"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </label>
            <select
              aria-label="Filter Golf R records by category"
              className="select w-full sm:w-52"
              value={category}
              onChange={(event) => setCategory(event.currentTarget.value)}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ItemTable
          items={filteredItems}
          onDelete={setDeletingItem}
          onEdit={(item) => setEditor({ item, kind: "edit" })}
        />
      </section>

      <AdminDialog
        description="Every field feeds the public ownership ledger. Attachments remain private."
        isOpen={editor !== null}
        title={
          editor?.kind === "edit" ? "Edit Golf R record" : "Add Golf R record"
        }
        onClose={() => setEditor(null)}
      >
        {editor?.kind === "edit" ? (
          <GolfItemEditor
            key={editor.item._id}
            item={editor.item}
            onDone={() => setEditor(null)}
          />
        ) : null}
        {editor?.kind === "create" ? (
          <GolfItemEditor key="create" onDone={() => setEditor(null)} />
        ) : null}
      </AdminDialog>

      <DeleteItemDialog
        key={deletingItem?._id ?? "closed"}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
}

type LedgerStatsProps = {
  items: GolfRItem[];
};

function LedgerStats(props: LedgerStatsProps) {
  const { items } = props;
  let attachmentCount = 0;
  let modificationCount = 0;
  let totalCost = 0;

  for (const item of items) {
    attachmentCount += item.attachments?.length ?? 0;
    totalCost += netCost(item);
    if (item.modification ?? item.installed ?? false) {
      modificationCount += 1;
    }
  }

  return (
    <section aria-label="Golf R ledger summary">
      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-none lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Records</div>
          <div className="stat-value text-3xl">{items.length}</div>
          <div className="stat-desc">Across the full ownership history</div>
        </div>
        <div className="stat">
          <div className="stat-title">Net ledger</div>
          <div className="stat-value text-3xl">{formatUsd(totalCost)}</div>
          <div className="stat-desc">After discounts and cashback</div>
        </div>
        <div className="stat">
          <div className="stat-title">Modifications</div>
          <div className="stat-value text-3xl">{modificationCount}</div>
          <div className="stat-desc">Records marked as modifications</div>
        </div>
        <div className="stat">
          <div className="stat-title">Private files</div>
          <div className="stat-value text-3xl">{attachmentCount}</div>
          <div className="stat-desc">Receipts and supporting documents</div>
        </div>
      </div>
    </section>
  );
}

type DeleteItemDialogProps = {
  item: GolfRItem | null;
  onClose: () => void;
};

function DeleteItemDialog(props: DeleteItemDialogProps) {
  const { item, onClose } = props;
  const deleteItem = useMutation(api.admin.golf_r.deleteItem);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!item) {
      return;
    }

    setError(null);
    setIsDeleting(true);
    try {
      await deleteItem({ id: item._id });
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "The record could not be deleted."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminDialog
      description="This also permanently deletes every Convex Storage attachment linked to the record."
      isOpen={item !== null}
      title="Delete ledger record?"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-box border border-error/25 bg-error/5 p-4">
          <p className="font-medium">{item?.name ?? "Selected record"}</p>
          {item ? (
            <p className="muted mt-1 text-sm">
              {categoryLabel(item.category)} · {formatUsd(netCost(item))} ·{" "}
              {item.attachments?.length ?? 0} files
            </p>
          ) : null}
        </div>
        {error ? (
          <div className="alert alert-error text-sm" role="alert">
            <span>{error}</span>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            className="btn"
            disabled={isDeleting}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-error"
            disabled={!item || isDeleting}
            type="button"
            onClick={() => void handleDelete()}
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            {isDeleting ? "Deleting…" : "Delete record"}
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}

type FilterItemsOptions = {
  category: string;
  items: GolfRItem[];
  search: string;
};

function filterItems(opts: FilterItemsOptions) {
  const { category, items, search } = opts;
  const normalizedSearch = search.trim().toLocaleLowerCase();

  return items.filter((item) => {
    if (category !== "all" && item.category !== category) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [item.name, item.description, categoryLabel(item.category)]
      .filter(Boolean)
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));
  });
}
