import { makeFunctionReference } from "convex/server";
import type { FunctionReference } from "convex/server";

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

export type PrintTextMessagePayload = {
  _type: "text-message";
  body: string;
  from: string;
};

export type PrintJobPayload =
  | PrintAlertPayload
  | PrintMessagePayload
  | PrintTextMessagePayload;
export type PrintJobStatus = "failed" | "printed" | "printing" | "queued";

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
  availableAt: number;
  channel?: string;
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
  createTextMessage: makeFunctionReference(
    "print_jobs:createTextMessage"
  ) as FunctionReference<
    "mutation",
    "public",
    CreateTextMessageArgs,
    CreateTextMessageResult
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
  watchQueue: makeFunctionReference(
    "print_jobs:watchQueue"
  ) as FunctionReference<
    "query",
    "public",
    WatchPrintQueueArgs,
    WatchPrintQueueResult
  >,
};
