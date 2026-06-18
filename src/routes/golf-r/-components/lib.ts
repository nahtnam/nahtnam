import type { Doc } from "convex/_generated/dataModel";

export type GolfRItem = Doc<"golfRItems">;

export const categoryLabels: Record<string, string> = {
  audio: "Audio",
  equipment: "Equipment",
  exterior: "Exterior",
  fee: "Fees & Registration",
  interior: "Interior",
  maintenance: "Maintenance",
  performance: "Performance",
  purchase: "Vehicle",
  tax: "Taxes",
  wheels: "Wheels & Tires",
};

export type CategoryAccent = {
  readonly badge: string;
  readonly bar: string;
  readonly dot: string;
};

export const categoryAccent: Record<string, CategoryAccent> = {
  audio: {
    badge: "border-violet-300 bg-violet-50 text-violet-700",
    bar: "bg-violet-500",
    dot: "bg-violet-500",
  },
  equipment: {
    badge: "border-orange-300 bg-orange-50 text-orange-700",
    bar: "bg-orange-500",
    dot: "bg-orange-500",
  },
  exterior: {
    badge: "border-cyan-300 bg-cyan-50 text-cyan-700",
    bar: "bg-cyan-500",
    dot: "bg-cyan-500",
  },
  fee: {
    badge: "border-zinc-300 bg-zinc-50 text-zinc-700",
    bar: "bg-zinc-500",
    dot: "bg-zinc-500",
  },
  interior: {
    badge: "border-amber-300 bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  maintenance: {
    badge: "border-sky-300 bg-sky-50 text-sky-700",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
  },
  performance: {
    badge: "border-rose-300 bg-rose-50 text-rose-700",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  purchase: {
    badge: "border-blue-300 bg-blue-50 text-blue-700",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  tax: {
    badge: "border-slate-300 bg-slate-50 text-slate-700",
    bar: "bg-slate-500",
    dot: "bg-slate-500",
  },
  wheels: {
    badge: "border-emerald-300 bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
};

const defaultAccent: CategoryAccent = {
  badge: "border-border bg-muted text-foreground",
  bar: "bg-primary",
  dot: "bg-primary",
};

export function getCategoryAccent(category: string): CategoryAccent {
  return categoryAccent[category] ?? defaultAccent;
}

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
  equipment: {
    chip: "border-orange-500/30 bg-orange-500/10 text-orange-200",
    dot: "bg-orange-400",
    panel: "from-orange-500/12 via-transparent to-transparent",
    track: "bg-orange-500",
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

export function isEquipmentItem(item: GolfRItem) {
  return item.category === "equipment";
}

export function isModItem(item: GolfRItem) {
  return (
    !isAccountingItem(item) &&
    !isMaintenanceItem(item) &&
    !isEquipmentItem(item)
  );
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
