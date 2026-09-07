import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import { useMutation } from "convex/react";
import { z } from "zod";

import { actionError } from "../-lib";

const settingsSchema = z.object({
  paperEnabled: z.boolean(),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\+[1-9]\d{7,14}$/u.test(value),
      "Use an international number, such as +14155550123, or leave this blank."
    ),
});
const SettingsForm = createForm(settingsSchema).configure({
  fields: {
    paperEnabled: { control: "checkbox", label: "Allow action receipts" },
    phone: {
      label: "Your personal SMS number (optional)",
      placeholder: "+14155550123",
      description:
        "Only this number can send replies. Leave blank to turn off SMS replies.",
    },
  },
});

export function ActionSettings(props: {
  settings: { configured: boolean; paperEnabled?: boolean; phone?: string };
}) {
  const { settings } = props;
  const configure = useMutation(api.ai.configure);
  return (
    <section className="card card-border bg-base-100">
      <div className="card-body gap-5">
        <div>
          <h2 className="card-title">
            {settings.configured
              ? "Delivery preferences"
              : "Make this your action center"}
          </h2>
          <p className="muted mt-2 text-sm">
            {settings.configured
              ? "Control paper and replies in one place."
              : "Bind these private actions to your administrator account. Other administrators will not be able to read them."}
          </p>
        </div>
        <SettingsForm.Form
          defaultValues={{
            paperEnabled: settings.paperEnabled ?? true,
            phone: settings.phone ?? "",
          }}
          resetOnSuccess={false}
          submitLabel={
            settings.configured ? "Save preferences" : "Set up action center"
          }
          onSubmit={async ({ paperEnabled, phone }) => {
            try {
              await configure({
                paperEnabled,
                ...(phone ? { phone } : { clearPhone: true }),
              });
              return {
                message: "Preferences saved.",
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
