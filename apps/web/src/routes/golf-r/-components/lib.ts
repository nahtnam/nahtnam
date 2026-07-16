import type { GolfRItem } from "./types";

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

const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function netCost(item: GolfRItem) {
  return item.price - (item.discount ?? 0) - (item.cashback ?? 0);
}

export function formatUsd(amount: number) {
  return usdFormatter.format(amount);
}

export function formatDate(dateString: string) {
  return dateFormatter.format(new Date(`${dateString}T00:00:00`));
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
  const sortedItems: GolfRItem[] = [];

  for (const item of items) {
    const insertionIndex = sortedItems.findIndex(
      (sortedItem) => compareGolfRItems(item, sortedItem) < 0
    );

    if (insertionIndex === -1) {
      sortedItems.push(item);
    } else {
      sortedItems.splice(insertionIndex, 0, item);
    }
  }

  return sortedItems;
}

function compareGolfRItems(left: GolfRItem, right: GolfRItem) {
  const dateComparison = right.date.localeCompare(left.date);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return right._creationTime - left._creationTime;
}
