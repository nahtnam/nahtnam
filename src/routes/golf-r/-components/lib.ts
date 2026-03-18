import type { Doc } from "convex/_generated/dataModel";

export type GolfRItem = Doc<"golfRItems">;

export const categoryLabels: Record<string, string> = {
  audio: "Audio",
  exterior: "Exterior",
  fee: "Fees & Registration",
  interior: "Interior",
  maintenance: "Maintenance",
  performance: "Performance",
  purchase: "Vehicle",
  tax: "Taxes",
  wheels: "Wheels & Tires",
};

export const categoryThemes: Record<
  string,
  { chip: string; dot: string; panel: string; track: string }
> = {
  audio: {
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    dot: "bg-violet-400",
    panel: "from-violet-500/12 via-transparent to-transparent",
    track: "bg-violet-500",
  },
  exterior: {
    chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    dot: "bg-cyan-400",
    panel: "from-cyan-500/12 via-transparent to-transparent",
    track: "bg-cyan-500",
  },
  fee: {
    chip: "border-zinc-500/30 bg-zinc-500/10 text-zinc-200",
    dot: "bg-zinc-400",
    panel: "from-zinc-500/12 via-transparent to-transparent",
    track: "bg-zinc-500",
  },
  interior: {
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
    panel: "from-amber-500/12 via-transparent to-transparent",
    track: "bg-amber-500",
  },
  maintenance: {
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
    panel: "from-sky-500/12 via-transparent to-transparent",
    track: "bg-sky-500",
  },
  performance: {
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
    panel: "from-rose-500/12 via-transparent to-transparent",
    track: "bg-rose-500",
  },
  purchase: {
    chip: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    dot: "bg-blue-400",
    panel: "from-blue-500/12 via-transparent to-transparent",
    track: "bg-blue-500",
  },
  tax: {
    chip: "border-slate-500/30 bg-slate-500/10 text-slate-200",
    dot: "bg-slate-400",
    panel: "from-slate-500/12 via-transparent to-transparent",
    track: "bg-slate-500",
  },
  wheels: {
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
    panel: "from-emerald-500/12 via-transparent to-transparent",
    track: "bg-emerald-500",
  },
};

export function netCost(item: GolfRItem) {
  return item.price - (item.discount ?? 0) - (item.cashback ?? 0);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMileage(mileage: number) {
  return `${mileage.toLocaleString("en-US")} mi`;
}

export function isAccountingCategory(category: string) {
  return category === "purchase" || category === "tax" || category === "fee";
}

export function isAccountingItem(item: GolfRItem) {
  return isAccountingCategory(item.category);
}

export function isMaintenanceItem(item: GolfRItem) {
  return item.category === "maintenance";
}

export function isModItem(item: GolfRItem) {
  return !isAccountingItem(item) && !isMaintenanceItem(item);
}

export function sortGolfRItems(items: readonly GolfRItem[]) {
  return [...items].sort((left, right) => {
    const dateComparison = right.date.localeCompare(left.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return right._creationTime - left._creationTime;
  });
}
