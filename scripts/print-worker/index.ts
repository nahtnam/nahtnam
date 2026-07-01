import net from "node:net";
import process from "node:process";
import { ConvexClient } from "convex/browser";
import {
  type ClaimedPrintJob,
  printJobFunctions,
} from "../../src/lib/print/function-references";
import { workerEnv } from "./config/env";
import { renderPrintJob } from "./templates";

const convexUrl = workerEnv.CONVEX_URL;
const printerHost = workerEnv.PRINTER_HOST;
const printerPort = workerEnv.PRINTER_PORT ?? 9100;
const workerId =
  workerEnv.PRINT_WORKER_ID ?? `receipt-printer-${crypto.randomUUID()}`;
const printSecret = workerEnv.PRINT_SECRET;

const client = new ConvexClient(convexUrl);
let draining = false;
let wakeTimer: NodeJS.Timeout | undefined;

const sendToPrinter = async (data: Uint8Array) =>
  new Promise<void>((resolve, reject) => {
    const socket = net.createConnection(
      { host: printerHost, port: printerPort, timeout: 10_000 },
      () => {
        socket.end(data);
      },
    );

    socket.on("close", () => {
      resolve();
    });
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy(new Error("Timed out connecting to printer"));
    });
  });

const printReceipt = async (job: ClaimedPrintJob) => {
  const receipt = await renderPrintJob(job);
  await sendToPrinter(receipt);
};

const claimNext = async () =>
  client.mutation(printJobFunctions.claimNext, {
    now: Date.now(),
    secret: printSecret,
    workerId,
  });

const markPrinted = async (job: ClaimedPrintJob) =>
  client.mutation(printJobFunctions.markPrinted, {
    jobId: job._id,
    secret: printSecret,
    workerId,
  });

const markFailed = async (job: ClaimedPrintJob, error: unknown) =>
  client.mutation(printJobFunctions.markFailed, {
    error: error instanceof Error ? error.message : String(error),
    jobId: job._id,
    secret: printSecret,
    workerId,
  });

const drainQueue = async () => {
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
};

const scheduleWake = (nextWakeAt?: number) => {
  if (wakeTimer) {
    clearTimeout(wakeTimer);
  }

  if (nextWakeAt === undefined) {
    return;
  }

  const delay = Math.max(0, nextWakeAt - Date.now());
  wakeTimer = setTimeout(() => {
    void drainQueue();
  }, delay);
};

client.onUpdate(
  printJobFunctions.watchQueue,
  { now: Date.now(), secret: printSecret },
  (queue) => {
    scheduleWake(queue.nextWakeAt);

    if (queue.readyCount > 0 || queue.stalePrintingCount > 0) {
      void drainQueue();
    }
  },
);

console.log(`Listening for print jobs as ${workerId}`);

const shutdown = () => {
  if (wakeTimer) {
    clearTimeout(wakeTimer);
  }

  void client.close();
  process.exitCode = 0;
};

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, shutdown);
}
