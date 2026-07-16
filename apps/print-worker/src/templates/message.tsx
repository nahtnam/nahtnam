import { Br, Cut, Line, Printer, Row, Text } from "react-thermal-printer";

import type { MessagePrintJob, ReceiptElement } from "./types";

export function renderMessageReceipt(job: MessagePrintJob): ReceiptElement {
  const createdAt = new Date(job._creationTime).toLocaleString();

  return (
    <Printer type="epson" width={42}>
      <Text align="center" size={{ height: 2, width: 2 }}>
        {job.payload.title ?? "MESSAGE"}
      </Text>
      <Text align="center">{job.source}</Text>
      <Line />
      <Text>{job.payload.body}</Text>
      <Br />
      <Line />
      <Row left="message" right={createdAt} />
      <Text align="center">#{job._id}</Text>
      <Br />
      <Cut />
    </Printer>
  );
}
