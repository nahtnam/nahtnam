import { isPrintActionPath } from "@repo/backend/print";
import { publicAppUrl } from "@repo/config/app";
import {
  Br,
  Cut,
  Line,
  Printer,
  QRCode,
  Row,
  Text,
} from "react-thermal-printer";

import type { MessagePrintJob, ReceiptElement } from "./types";

export function renderMessageReceipt(job: MessagePrintJob): ReceiptElement {
  const createdAt = new Date(job._creationTime).toLocaleString();
  const { actionPath } = job.payload;
  if (actionPath !== undefined && !isPrintActionPath(actionPath)) {
    throw new Error("Action path must stay within /ai");
  }
  const actionUrl = actionPath ? `${publicAppUrl}${actionPath}` : undefined;

  return (
    <Printer type="epson" width={42}>
      <Text align="center" size={{ height: 2, width: 2 }}>
        {job.payload.title ?? "MESSAGE"}
      </Text>
      {!actionUrl && <Text align="center">{job.source}</Text>}
      <Line />
      <Text>{job.payload.body}</Text>
      <Br />
      <Line />
      {actionUrl ? (
        <>
          <Text align="center">Scan to review or update</Text>
          <QRCode
            align="center"
            cellSize={4}
            content={actionUrl}
            correction="M"
          />
          <Text align="center">{new URL(publicAppUrl).hostname}/ai</Text>
          <Text align="center">Done / Snooze / Dismiss</Text>
          <Text align="center">{createdAt}</Text>
        </>
      ) : (
        <>
          <Row left="message" right={createdAt} />
          <Text align="center">#{job._id}</Text>
        </>
      )}
      <Br />
      <Cut />
    </Printer>
  );
}
