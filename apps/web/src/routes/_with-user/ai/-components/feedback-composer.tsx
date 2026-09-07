import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { useMutation } from "convex/react";
import { useRef } from "react";
import { z } from "zod";

import { actionError } from "../-lib";

const feedbackSchema = z.object({
  body: z
    .string()
    .max(4000, "Keep your reply under 4,000 characters.")
    .refine((body) => body.trim().length > 0, "Write a reply first."),
});
const FeedbackForm = createForm(feedbackSchema).configure({
  fields: {
    body: {
      control: "textarea",
      label: "Your reply",
      placeholder: "Add context, change a preference, or tell me what matters…",
    },
  },
});

type ReplyContext = {
  code?: string;
  expectedVersion?: number;
  receiptId?: Id<"aiReceipts">;
};

export function FeedbackComposer(props: ReplyContext) {
  const { code, expectedVersion, receiptId } = props;
  const submitFeedback = useMutation(api.ai.submitFeedback);
  const draftContext = useRef<ReplyContext | null>(null);
  const pending = useRef<{
    body: string;
    code?: string;
    expectedVersion?: number;
    idempotencyKey: string;
    receiptId?: Id<"aiReceipts">;
  } | null>(null);

  return (
    <section className="card card-border bg-base-100">
      <div className="card-body gap-4">
        <div>
          <h2 className="card-title">Tell me more</h2>
          <p className="muted mt-2 text-sm">
            Write freely. Your reply will be saved for the next automation run.
          </p>
        </div>
        <FeedbackForm.Form
          defaultValues={{ body: "" }}
          resetOnSuccess
          submitLabel="Save reply"
          onChange={(event) => {
            if (!(event.target instanceof HTMLTextAreaElement)) {
              return;
            }
            if (event.target.value.length === 0) {
              draftContext.current = null;
              pending.current = null;
              return;
            }
            draftContext.current ??= { code, expectedVersion, receiptId };
          }}
          onSubmit={async ({ body }) => {
            const context = (draftContext.current ??= {
              code,
              expectedVersion,
              receiptId,
            });
            if (pending.current?.body !== body) {
              pending.current = {
                ...context,
                body,
                idempotencyKey: crypto.randomUUID(),
              };
            }
            try {
              await submitFeedback(pending.current);
              pending.current = null;
              draftContext.current = null;
              return {
                message: "Saved for the next automation run.",
                status: "success" as const,
              };
            } catch (error) {
              return {
                errorKind: "business" as const,
                fieldErrors: {},
                formErrors: [actionError(error)],
                status: "error" as const,
              };
            }
          }}
        />
      </div>
    </section>
  );
}
