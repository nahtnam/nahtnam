import { isPrintActionPath } from "@repo/backend/print";
import type {
  CreatePrintJobArgs,
  CreatePrintJobResult,
  ManagePrintJobArgs,
  PrintJobSnapshot,
} from "@repo/backend/print";
import { z } from "zod";

const printRequestSchema = z.object({
  availableAt: z.number().finite().nonnegative().optional(),
  expiresAt: z.number().finite().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(200).optional(),
  payload: z.discriminatedUnion("_type", [
    z.object({
      _type: z.literal("message"),
      actionPath: z.string().refine(isPrintActionPath).optional(),
      body: z.string().min(1).max(4000),
      title: z.string().min(1).max(200).optional(),
    }),
    z.object({
      _type: z.literal("alert"),
      body: z.string().min(1).max(4000),
      title: z.string().min(1).max(200),
    }),
  ]),
  source: z.string().min(1).max(100).default("api"),
});

const jobIdSchema = z.string().min(1).max(128);
const managementSchema = z.object({
  jobId: jobIdSchema,
  operation: z.enum(["cancel", "retry"]),
});

export type PrintApiClient = {
  cancel: (args: ManagePrintJobArgs) => Promise<CreatePrintJobResult>;
  create: (args: CreatePrintJobArgs) => Promise<CreatePrintJobResult>;
  getStatus: (args: ManagePrintJobArgs) => Promise<PrintJobSnapshot | null>;
  retry: (args: ManagePrintJobArgs) => Promise<CreatePrintJobResult>;
};

function errorResponse(status: number, message: string) {
  return printJson({ error: { message } }, status);
}

function printJson(value: unknown, status = 200) {
  return Response.json(value, {
    headers: { "Cache-Control": "no-store, private" },
    status,
  });
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

async function dispatchPrintRequest(
  request: Request,
  client: PrintApiClient,
  secret: string
) {
  if (request.method === "GET") {
    const parsed = jobIdSchema.safeParse(
      new URL(request.url).searchParams.get("jobId")
    );
    if (!parsed.success) {
      return errorResponse(400, "A print job ID is required");
    }
    const job = await client.getStatus({ jobId: parsed.data, secret });
    return job ? printJson({ job }) : errorResponse(404, "Print job not found");
  }

  const body = await readJson(request);
  if (request.method === "PATCH") {
    const parsed = managementSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, "Invalid print operation");
    }
    const job = await client[parsed.data.operation]({
      jobId: parsed.data.jobId,
      secret,
    });
    return printJson({ job });
  }

  const parsed = printRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "Invalid print request");
  }
  const job = await client.create({ ...parsed.data, secret });
  return printJson({ job });
}

export async function handlePrintRequest(
  request: Request,
  client: PrintApiClient
) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || !authorization.slice(7).trim()) {
    return errorResponse(401, "Unauthorized");
  }

  try {
    return await dispatchPrintRequest(request, client, authorization.slice(7));
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return errorResponse(401, "Unauthorized");
    }
    if (error instanceof Error && error.message.includes("INVALID_STATE")) {
      return errorResponse(
        409,
        "Print job cannot perform this operation in its current state"
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes("INVALID_INPUT") ||
        error.message.includes("ArgumentValidationError"))
    ) {
      return errorResponse(400, "Invalid print request");
    }
    throw error;
  }
}
