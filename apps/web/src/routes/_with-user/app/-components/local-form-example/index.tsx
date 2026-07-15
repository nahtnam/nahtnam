import { createForm } from "@formadapter/react";
import { z } from "zod";

const localFormSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(60, "Enter no more than 60 characters."),
});

const LocalForm = createForm(localFormSchema).configure({
  fields: {
    projectName: {
      description: "Used only to render the confirmation below.",
      label: "Project name",
      placeholder: "Acme",
    },
  },
});

export function LocalFormExample() {
  return (
    <section
      aria-labelledby="local-form-example-title"
      className="card card-border bg-base-100"
    >
      <div className="card-body gap-6">
        <div className="space-y-2">
          <h2 className="card-title heading" id="local-form-example-title">
            Local form example
          </h2>
          <p className="muted">
            This validates entirely in your browser. Nothing is saved or sent to
            Convex.
          </p>
        </div>
        <LocalForm.Form
          defaultValues={{ projectName: "My app" }}
          onSubmit={(values) => ({
            message: `${values.projectName} validated locally; nothing was saved.`,
            status: "success",
          })}
          submitLabel="Validate form"
        />
      </div>
    </section>
  );
}
