import { z } from "zod";

const workerEnvSchema = z.object({
  CONVEX_URL: z.url(),
  PRINTER_HOST: z.string().min(1),
  PRINTER_PORT: z.coerce.number().int().min(1).max(65_535).optional(),
  PRINT_SECRET: z.string().min(1),
  PRINT_WORKER_ID: z.string().min(1).optional(),
});

export const workerEnv = workerEnvSchema.parse(process.env);
