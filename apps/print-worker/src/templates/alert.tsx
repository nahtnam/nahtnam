import { Br, Cut, Line, Printer, Row, Text } from "react-thermal-printer";

import type { AlertPrintJob, ReceiptElement } from "./types";

export function renderAlertReceipt(job: AlertPrintJob): ReceiptElement {
  const createdAt = new Date(job._creationTime).toLocaleString();

  return (
    <Printer type="epson" width={42}>
      <Text align="center">!!!!!!!! ACTION NEEDED !!!!!!!!</Text>
      <Line />
      <Text align="center" size={{ height: 2, width: 2 }}>
        {job.payload.title}
      </Text>
      <Br />
      <Text>{job.payload.body}</Text>
      <Br />
      <Line />
      <Row left={job.source} right={createdAt} />
      <Text align="center">#{job._id}</Text>
      <Br />
      <Cut />
    </Printer>
  );
}
