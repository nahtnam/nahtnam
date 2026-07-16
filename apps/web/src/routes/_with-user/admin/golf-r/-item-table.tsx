import {
  ExternalLinkIcon,
  FileTextIcon,
  PencilIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";

import { categoryLabel, formatDate, formatUsd, netCost } from "./-lib";
import type { GolfRItem } from "./-types";

type ItemTableProps = {
  items: GolfRItem[];
  onDelete: (item: GolfRItem) => void;
  onEdit: (item: GolfRItem) => void;
};

export function ItemTable(props: ItemTableProps) {
  const { items, onDelete, onEdit } = props;

  if (items.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center rounded-box border border-dashed border-base-300 bg-base-100 px-6 text-center">
        <div>
          <WrenchIcon className="mx-auto size-8 text-base-content/30" />
          <h2 className="heading mt-3 text-xl">No matching records</h2>
          <p className="muted mt-1 text-sm">
            Change the filters or add the first entry to the build ledger.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>Record</th>
            <th>Category</th>
            <th>Status</th>
            <th className="text-right">Net cost</th>
            <th className="text-right">Mileage</th>
            <th>Date</th>
            <th className="text-right">Files</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td className="min-w-56">
                <div className="flex items-center gap-2 font-medium">
                  <span>{item.name}</span>
                  {item.url ? (
                    <a
                      aria-label={`Open URL for ${item.name}`}
                      className="link link-hover text-base-content/45"
                      href={item.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mt-1 max-w-72 truncate text-xs text-base-content/50">
                    {item.description}
                  </p>
                ) : null}
              </td>
              <td>
                <span className="badge badge-outline whitespace-nowrap">
                  {categoryLabel(item.category)}
                </span>
              </td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {(item.modification ?? item.installed) ? (
                    <span className="badge badge-sm badge-neutral">Mod</span>
                  ) : null}
                  {item.installed === true ? (
                    <span className="badge badge-sm badge-success">
                      Installed
                    </span>
                  ) : null}
                  {item.modification === false || item.installed === false ? (
                    <span className="badge badge-sm badge-ghost">
                      {item.modification === false
                        ? "Not a mod"
                        : "Not installed"}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="text-right font-mono text-sm tabular-nums">
                <p>{formatUsd(netCost(item))}</p>
                {netCost(item) === item.price ? null : (
                  <p className="text-[0.65rem] text-base-content/45 line-through">
                    {formatUsd(item.price)}
                  </p>
                )}
              </td>
              <td className="text-right font-mono text-xs tabular-nums">
                {item.mileage === undefined
                  ? "—"
                  : item.mileage.toLocaleString("en-US")}
              </td>
              <td className="whitespace-nowrap font-mono text-xs">
                {formatDate(item.date)}
              </td>
              <td className="text-right">
                <span className="badge badge-ghost gap-1">
                  <FileTextIcon className="size-3" />
                  {item.attachments?.length ?? 0}
                </span>
              </td>
              <td>
                <div className="flex justify-end gap-1">
                  <button
                    aria-label={`Edit ${item.name}`}
                    className="btn btn-ghost btn-square btn-sm"
                    type="button"
                    onClick={() => onEdit(item)}
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${item.name}`}
                    className="btn btn-ghost btn-square btn-sm text-error"
                    type="button"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
