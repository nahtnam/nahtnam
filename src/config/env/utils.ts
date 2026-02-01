import z from "zod";

export const REQUIRED_STRING = z.string().min(1);
export const OPTIONAL_STRING = z.string().optional();

export const REQUIRED_URL = z.url();
export const OPTIONAL_URL = z.url().optional();

export const REQUIRED_NUMBER = z.coerce.number();
export const OPTIONAL_NUMBER = z.coerce.number().optional();

export const REQUIRED_BOOLEAN = z
  .string()
  .refine((s) => s === "true" || s === "false")
  .transform((s) => s === "true");
export const OPTIONAL_BOOLEAN = z
  .string()
  .optional()
  .refine((s) => s === "true" || s === "false" || s === undefined)
  .transform((s) => s === "true");
