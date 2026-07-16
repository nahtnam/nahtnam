/* oxlint-disable no-await-in-loop -- A physical printer must process claimed jobs serially. */
import net from "node:net";

import type { ClaimedPrintJob } from "@repo/backend/print";
import { printJobFunctions } from "@repo/backend/print";
import { ConvexClient } from "convex/browser";

import { workerEnv } from "./config/env";
import { renderPrintJob } from "./templates";

const printerPort = workerEnv.PRINTER_PORT ?? 9100;
const workerId =
  workerEnv.PRINT_WORKER_ID ?? `receipt-printer-${crypto.randomUUID()}`;
const client = new ConvexClient(workerEnv.CONVEX_URL);
let draining = false;
let wakeTimer: NodeJS.Timeout | undefined;

async function sendToPrinter(data: Uint8Array) {
  // Node's socket API is callback-based; this promise provides backpressure.
  // oxlint-disable-next-line promise/avoid-new
  await new Promise<void>((resolve, reject) => {
    const socket = net.createConnection(
      {
        host: workerEnv.PRINTER_HOST,
        port: printerPort,
        timeout: 10_000,
      },
      () => {
        socket.end(data);
      }
    );

    socket.on("close", resolve);
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy(new Error("Timed out connecting to printer"));
    });
  });
}

async function printReceipt(job: ClaimedPrintJob) {
  await sendToPrinter(await renderPrintJob(job));
}

function claimNext() {
  return client.mutation(printJobFunctions.claimNext, {
    now: Date.now(),
    secret: workerEnv.PRINT_SECRET,
    workerId,
  });
}

function markPrinted(job: ClaimedPrintJob) {
  return client.mutation(printJobFunctions.markPrinted, {
    jobId: job._id,
    secret: workerEnv.PRINT_SECRET,
    workerId,
  });
}

function markFailed(job: ClaimedPrintJob, error: unknown) {
  return client.mutation(printJobFunctions.markFailed, {
    error: error instanceof Error ? error.message : String(error),
    jobId: job._id,
    secret: workerEnv.PRINT_SECRET,
    workerId,
  });
}

async function drainQueue() {
  if (draining) {
    return;
  }

  draining = true;

  try {
    while (true) {
      const job = await claimNext();
      if (!job) {
        break;
      }

      try {
        await printReceipt(job);
        await markPrinted(job);
        console.log(`Printed ${job._id}`);
      } catch (error) {
        await markFailed(job, error);
        console.error(`Failed ${job._id}`, error);
      }
    }
  } finally {
    draining = false;
  }
}

function scheduleWake(nextWakeAt?: number) {
  if (wakeTimer) {
    clearTimeout(wakeTimer);
  }

  if (nextWakeAt === undefined) {
    return;
  }

  wakeTimer = setTimeout(
    () => {
      void drainQueue();
    },
    Math.max(0, nextWakeAt - Date.now())
  );
}

client.onUpdate(
  printJobFunctions.watchQueue,
  { now: Date.now(), secret: workerEnv.PRINT_SECRET },
  (queue) => {
    scheduleWake(queue.nextWakeAt);

    if (queue.readyCount > 0 || queue.stalePrintingCount > 0) {
      void drainQueue();
    }
  }
);

console.log(`Listening for print jobs as ${workerId}`);

function shutdown() {
  if (wakeTimer) {
    clearTimeout(wakeTimer);
  }

  void client.close();
  process.exitCode = 0;
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, shutdown);
}
