import type { BooleanChoice, GolfRItem } from "./-types";

export const categoryOptions = [
  { label: "Vehicle purchase", value: "purchase" },
  { label: "Taxes", value: "tax" },
  { label: "Fees & registration", value: "fee" },
  { label: "Audio", value: "audio" },
  { label: "Equipment", value: "equipment" },
  { label: "Performance", value: "performance" },
  { label: "Wheels & tires", value: "wheels" },
  { label: "Exterior", value: "exterior" },
  { label: "Interior", value: "interior" },
  { label: "Maintenance", value: "maintenance" },
] as const;

export const booleanOptions = [
  { label: "Not set", value: "unset" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
] as const;

const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export function formatUsd(amount: number) {
  return usdFormatter.format(amount);
}

export function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function netCost(item: GolfRItem) {
  return item.price - (item.discount ?? 0) - (item.cashback ?? 0);
}

export function categoryLabel(category: string) {
  return (
    categoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}

export function booleanChoice(value: boolean | null): BooleanChoice {
  if (value === null) {
    return "unset";
  }

  return value ? "true" : "false";
}

export function optionalBoolean(value: BooleanChoice) {
  if (value === "unset") {
    return;
  }

  return value === "true";
}

export function formError(error: unknown) {
  return {
    errorKind: "business" as const,
    fieldErrors: {},
    formErrors: [
      error instanceof Error ? error.message : "The change could not be saved.",
    ],
    status: "error" as const,
  };
}
