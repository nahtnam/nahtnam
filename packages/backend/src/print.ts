import { makeFunctionReference } from "convex/server";
import type { FunctionReference } from "convex/server";

export { isPrintActionPath } from "./print-path";

export type PrintMessagePayload = {
  _type: "message";
  actionPath?: string;
  body: string;
  title?: string;
};

export type PrintAlertPayload = {
  _type: "alert";
  body: string;
  title: string;
};

export type PrintTextMessagePayload = {
  _type: "text-message";
  body: string;
  from: string;
};

export type PrintJobPayload =
  | PrintAlertPayload
  | PrintMessagePayload
  | PrintTextMessagePayload;
export type PrintJobStatus =
  | "cancelled"
  | "expired"
  | "failed"
  | "printed"
  | "printing"
  | "queued";

export type PrintState = {
  attempts: number;
  cancelledAt?: number;
  claimedAt?: number;
  claimedBy?: string;
  expiredAt?: number;
  failedAt?: number;
  lastError?: string;
  leaseExpiresAt?: number;
  printedAt?: number;
  retryCount?: number;
};

export type CreatePrintJobArgs = {
  availableAt?: number;
  expiresAt?: number;
  idempotencyKey?: string;
  payload: PrintJobPayload;
  secret: string;
  source: string;
};

export type CreatePrintJobResult = {
  id: string;
  status: PrintJobStatus;
};

export type CreateTextMessageArgs = {
  body: string;
  from: string;
  messageSid: string;
  secret: string;
};

export type CreateTextMessageResult =
  | { id: string; status: "queued" }
  | { status: "duplicate" | "rate-limited" };

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
  _creationTime: number;
  _id: string;
  aiReceiptId?: string;
  availableAt: number;
  channel?: string;
  expiresAt?: number;
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

export type ManagePrintJobArgs = {
  jobId: string;
  secret: string;
};

export type PrintJobSnapshot = {
  availableAt: number;
  expiresAt?: number;
  id: string;
  idempotencyKey?: string;
  printState: PrintState;
  status: PrintJobStatus;
};

export const printJobFunctions = {
  cancel: makeFunctionReference("print_jobs:cancel") as FunctionReference<
    "mutation",
    "public",
    ManagePrintJobArgs,
    CreatePrintJobResult
  >,
  claimNext: makeFunctionReference("print_jobs:claimNext") as FunctionReference<
    "mutation",
    "public",
    ClaimNextPrintJobArgs,
    ClaimedPrintJob | null
  >,
  create: makeFunctionReference("print_jobs:create") as FunctionReference<
    "mutation",
    "public",
    CreatePrintJobArgs,
    CreatePrintJobResult
  >,
  createTextMessage: makeFunctionReference(
    "print_jobs:createTextMessage"
  ) as FunctionReference<
    "mutation",
    "public",
    CreateTextMessageArgs,
    CreateTextMessageResult
  >,
  getStatus: makeFunctionReference("print_jobs:getStatus") as FunctionReference<
    "query",
    "public",
    ManagePrintJobArgs,
    PrintJobSnapshot | null
  >,
  markFailed: makeFunctionReference(
    "print_jobs:markFailed"
  ) as FunctionReference<
    "mutation",
    "public",
    MarkFailedArgs,
    { retrying: boolean }
  >,
  markPrinted: makeFunctionReference(
    "print_jobs:markPrinted"
  ) as FunctionReference<
    "mutation",
    "public",
    MarkPrintedArgs,
    { ok: boolean }
  >,
  retry: makeFunctionReference("print_jobs:retry") as FunctionReference<
    "mutation",
    "public",
    ManagePrintJobArgs,
    CreatePrintJobResult
  >,
  watchQueue: makeFunctionReference(
    "print_jobs:watchQueue"
  ) as FunctionReference<
    "query",
    "public",
    WatchPrintQueueArgs,
    WatchPrintQueueResult
  >,
};
