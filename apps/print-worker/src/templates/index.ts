import type { ClaimedPrintJob } from "@repo/backend/print";
import { render } from "react-thermal-printer";

import { renderAlertReceipt } from "./alert";
import { renderMessageReceipt } from "./message";

export function renderPrintJob(job: ClaimedPrintJob) {
  const receipt =
    job.payload._type === "alert"
      ? renderAlertReceipt({ ...job, payload: job.payload })
      : renderMessageReceipt({ ...job, payload: job.payload });

  return render(receipt);
}
