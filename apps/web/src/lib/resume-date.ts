type DifferenceInUtcMonthsOptions = {
  readonly end: Date;
  readonly start: Date;
};

export function differenceInUtcMonths(options: DifferenceInUtcMonthsOptions) {
  const { end, start } = options;
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth();

  if (end.getUTCDate() < start.getUTCDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

export function formatUtcMonthYear(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}

export function getUtcYear(timestamp: number) {
  return new Date(timestamp).getUTCFullYear();
}
