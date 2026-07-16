import type {
  ClaimedPrintJob,
  PrintAlertPayload,
  PrintMessagePayload,
} from "@repo/backend/print";
import type { render } from "react-thermal-printer";

export type ReceiptElement = Parameters<typeof render>[0];

export type AlertPrintJob = ClaimedPrintJob & {
  payload: PrintAlertPayload;
};

export type MessagePrintJob = ClaimedPrintJob & {
  payload: PrintMessagePayload;
};
