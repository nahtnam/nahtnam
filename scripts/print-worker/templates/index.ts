import { render } from "react-thermal-printer";
import { match } from "ts-pattern";
import { type ClaimedPrintJob } from "../../../src/lib/print/function-references";
import { renderAlertReceipt } from "./alert";
import { renderMessageReceipt } from "./message";

export const renderPrintJob = async (job: ClaimedPrintJob) => {
  const receipt = match(job.payload)
    .with({ _type: "message" }, (payload) =>
      renderMessageReceipt({ ...job, payload }),
    )
    .with({ _type: "alert" }, (payload) =>
      renderAlertReceipt({ ...job, payload }),
    )
    .exhaustive();

  return render(receipt);
};
