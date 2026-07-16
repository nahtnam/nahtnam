import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareTextIcon, PrinterIcon } from "lucide-react";

import { createSeo, pageSeo } from "@/lib/seo";

const displayPhoneNumber = "+1-855-624-8626";
const phoneword = "855-nahtnam";
const smsHref = "sms:+18556248626";

export const Route = createFileRoute("/text-me/")({
  component: TextMePage,
  head: () => createSeo(pageSeo.textMe),
});

function TextMePage() {
  return (
    <div className="page-shell page-shell-wide flex min-h-[calc(100svh-15rem)] items-center">
      <section
        aria-labelledby="text-me-heading"
        className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:gap-24"
      >
        <div className="max-w-xl">
          <p className="route-kicker">Personal receipt line</p>
          <h1
            className="heading mt-5 text-5xl sm:text-7xl"
            id="text-me-heading"
          >
            Text me. It prints.
          </h1>
          <p className="muted mt-6 text-lg leading-8">
            Send a message to my toll-free number and it will print on the
            receipt printer sitting on my desk.
          </p>

          <a
            aria-label={`Text ${phoneword} at ${displayPhoneNumber}`}
            className="btn btn-primary btn-lg mt-9 gap-3"
            href={smsHref}
          >
            <MessageSquareTextIcon aria-hidden="true" className="size-5" />
            Open Messages
          </a>

          <p className="mt-10 border-t border-base-300 pt-5 text-xs leading-6 text-base-content/55">
            By texting {displayPhoneNumber}, you agree that your message may be
            received by this personal receipt-printer project and may trigger a
            transactional reply confirming it was printed. Message and data
            rates may apply.
          </p>
        </div>

        <Receipt
          receiptPhoneNumber={displayPhoneNumber}
          receiptPhoneword={phoneword}
        />
      </section>
    </div>
  );
}

type ReceiptProps = {
  receiptPhoneNumber: string;
  receiptPhoneword: string;
};

function Receipt(props: ReceiptProps) {
  const { receiptPhoneNumber, receiptPhoneword } = props;

  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-sm lg:mx-0 lg:justify-self-end"
    >
      <div className="rounded-t-box bg-neutral px-6 pt-5 pb-4 text-neutral-content shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PrinterIcon className="size-4" />
            <span className="font-mono text-[0.68rem] tracking-[0.16em] uppercase">
              Desk printer
            </span>
          </div>
          <span className="size-2 rounded-full bg-primary" />
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-neutral-content/20" />
      </div>

      <div className="mx-4 border-x border-b border-base-300 bg-base-100 px-6 pt-8 pb-10 shadow-sm sm:px-8">
        <div className="text-center font-mono">
          <p className="text-[0.68rem] tracking-[0.18em] text-base-content/55 uppercase">
            Incoming messages
          </p>
          <div className="my-6 border-t border-dashed border-base-300" />
          <p className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
            {receiptPhoneword}
          </p>
          <p className="mt-2 text-sm text-base-content/55">
            {receiptPhoneNumber}
          </p>
          <div className="my-6 border-t border-dashed border-base-300" />
          <p className="text-xs leading-6 text-base-content/60 uppercase">
            SMS → paper
            <br />
            San Francisco, California
          </p>
        </div>
      </div>
    </div>
  );
}
