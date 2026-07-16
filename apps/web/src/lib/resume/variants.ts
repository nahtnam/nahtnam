export const defaultResumeVariant = "ic";

export const resumeVariantIds = ["ic"] as const;

export const resumeVariants = {
  ic: {
    label: "Individual Contributor",
  },
} as const satisfies Record<
  (typeof resumeVariantIds)[number],
  { readonly label: string }
>;

export type ResumeVariant = (typeof resumeVariantIds)[number];

export function isResumeVariant(value: string): value is ResumeVariant {
  return resumeVariantIds.includes(value as ResumeVariant);
}
