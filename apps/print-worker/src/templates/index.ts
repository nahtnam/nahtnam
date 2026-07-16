import type { ClaimedPrintJob } from "@repo/backend/print";
import { render } from "react-thermal-printer";

import { renderAlertReceipt } from "./alert";
import { renderMessageReceipt } from "./message";

export function renderPrintJob(job: ClaimedPrintJob) {
  const { payload } = job;
  let receipt;

  switch (payload._type) {
    case "alert": {
      receipt = renderAlertReceipt({ ...job, payload });
      break;
    }
    case "text-message": {
      receipt = renderMessageReceipt({
        ...job,
        payload: {
          _type: "message",
          body: payload.body,
          title: `TEXT FROM ${payload.from}`,
        },
      });
      break;
    }
    default: {
      receipt = renderMessageReceipt({ ...job, payload });
    }
  }

  return render(receipt);
}
