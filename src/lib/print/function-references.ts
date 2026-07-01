import { type FunctionReference, makeFunctionReference } from "convex/server";

export type PrintMessagePayload = {
  _type: "message";
  body: string;
  title?: string;
};

export type PrintAlertPayload = {
  _type: "alert";
  body: string;
  title: string;
};

export type PrintJobPayload = PrintMessagePayload | PrintAlertPayload;

export type PrintJobStatus = "queued" | "printing" | "printed" | "failed";

export type PrintState = {
  attempts: number;
  claimedAt?: number;
  claimedBy?: string;
  failedAt?: number;
  lastError?: string;
  leaseExpiresAt?: number;
  printedAt?: number;
};

export type CreatePrintJobArgs = {
  availableAt?: number;
  idempotencyKey?: string;
  payload: PrintJobPayload;
  secret: string;
  source: string;
};

export type CreatePrintJobResult = {
  id: string;
  status: PrintJobStatus;
};

export type WatchPrintQueueArgs = {
  now: number;
  secret: string;
};

export type WatchPrintQueueResult = {
  nextAvailableAt?: number;
  nextWakeAt?: number;
  readyCount: number;
  stalePrintingCount: number;
};

export type ClaimedPrintJob = {
  _id: string;
  _creationTime: number;
  availableAt: number;
  idempotencyKey?: string;
  payload: PrintJobPayload;
  printState: PrintState;
  source: string;
  status: "printing";
};

export type ClaimNextPrintJobArgs = {
  now: number;
  secret: string;
  workerId: string;
};

export type MarkPrintedArgs = {
  jobId: string;
  secret: string;
  workerId: string;
};

export type MarkFailedArgs = MarkPrintedArgs & {
  error: string;
};

export const printJobFunctions = {
  claimNext: makeFunctionReference("print_jobs:claimNext") as FunctionReference<
    "mutation",
    "public",
    ClaimNextPrintJobArgs,
    ClaimedPrintJob | undefined
  >,
  create: makeFunctionReference("print_jobs:create") as FunctionReference<
    "mutation",
    "public",
    CreatePrintJobArgs,
    CreatePrintJobResult
  >,
  markFailed: makeFunctionReference(
    "print_jobs:markFailed",
  ) as FunctionReference<
    "mutation",
    "public",
    MarkFailedArgs,
    { retrying: boolean }
  >,
  markPrinted: makeFunctionReference(
    "print_jobs:markPrinted",
  ) as FunctionReference<
    "mutation",
    "public",
    MarkPrintedArgs,
    { ok: boolean }
  >,
  watchQueue: makeFunctionReference(
    "print_jobs:watchQueue",
  ) as FunctionReference<
    "query",
    "public",
    WatchPrintQueueArgs,
    WatchPrintQueueResult
  >,
};
