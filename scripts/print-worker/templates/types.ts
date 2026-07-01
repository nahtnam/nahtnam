import { type render } from "react-thermal-printer";
import {
  type ClaimedPrintJob,
  type PrintAlertPayload,
  type PrintMessagePayload,
} from "../../../src/lib/print/function-references";

export type ReceiptElement = Parameters<typeof render>[0];

export type AlertPrintJob = ClaimedPrintJob & {
  payload: PrintAlertPayload;
};

export type MessagePrintJob = ClaimedPrintJob & {
  payload: PrintMessagePayload;
};
