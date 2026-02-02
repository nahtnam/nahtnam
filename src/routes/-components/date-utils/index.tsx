import { differenceInMonths } from "date-fns";

export function formatDate(date: Date | null) {
  if (!date) {
    return "Present";
  }
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDuration(startDate: Date, endDate: Date | null) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffMonths = differenceInMonths(end, start);
  const totalMonths = diffMonths + 1;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months}mo`;
  }
  if (months === 0) {
    return `${years}yr`;
  }
  return `${years}yr ${months}mo`;
}
