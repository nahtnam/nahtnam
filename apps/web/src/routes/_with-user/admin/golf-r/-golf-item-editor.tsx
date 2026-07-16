import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import { useMutation } from "convex/react";
import { z } from "zod";

import { AttachmentManager } from "./-attachment-manager";
import {
  booleanChoice,
  booleanOptions,
  categoryOptions,
  formError,
  optionalBoolean,
} from "./-lib";
import type { BooleanChoice, GolfRItem } from "./-types";
import { useAttachmentDraft } from "./-use-attachment-draft";

const NON_NEGATIVE_MESSAGE = "Use 0 or more.";
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const requiredAmount = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ error: "Enter an amount." }).min(0, NON_NEGATIVE_MESSAGE)
);

const optionalAmount = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0, NON_NEGATIVE_MESSAGE).optional()
);

const optionalMileage = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number()
    .int("Mileage must be a whole number.")
    .min(0, NON_NEGATIVE_MESSAGE)
    .optional()
);

const golfItemSchema = z.object({
  cashback: optionalAmount,
  category: z.string().min(1, "Choose a category."),
  date: z.string().min(1, "Choose a date."),
  description: z.string().trim().max(1000, "Keep this under 1,000 characters."),
  discount: optionalAmount,
  installed: z.enum(["unset", "true", "false"]),
  mileage: optionalMileage,
  modification: z.enum(["unset", "true", "false"]),
  name: z.string().trim().min(1, "Enter a name."),
  price: requiredAmount,
  url: z
    .string()
    .trim()
    .max(2000, "Keep this URL under 2,000 characters.")
    .refine(
      (value) => value.length === 0 || URL.canParse(value),
      "Enter a complete URL."
    ),
});

const GolfItemForm = createForm(golfItemSchema).configure({
  fields: {
    cashback: {
      description: "Optional rebate or statement credit.",
      label: "Cashback ($)",
      placeholder: "0.00",
    },
    category: {
      control: "select",
      label: "Category",
      options: categoryOptions,
    },
    date: { control: "date", label: "Record date" },
    description: {
      control: "textarea",
      label: "Description (optional)",
      placeholder: "Part details, service notes, or context…",
    },
    discount: {
      description: "Optional discount applied at purchase.",
      label: "Discount ($)",
      placeholder: "0.00",
    },
    installed: {
      control: "select",
      description: "Installation state, when it applies to this record.",
      label: "Installed",
      options: booleanOptions,
    },
    mileage: {
      label: "Odometer (optional)",
      placeholder: "12500",
    },
    modification: {
      control: "select",
      description: "Whether this record counts as a vehicle modification.",
      label: "Modification",
      options: booleanOptions,
    },
    name: {
      label: "Record name",
      placeholder: "Oil change, wheels, purchase price…",
    },
    price: {
      label: "Price ($)",
      placeholder: "0.00",
    },
    url: {
      control: "url",
      label: "Reference URL (optional)",
      placeholder: "https://…",
    },
  },
});

type GolfItemEditorProps = {
  item?: GolfRItem;
  onDone: () => void;
};

export function GolfItemEditor(props: GolfItemEditorProps) {
  const { item, onDone } = props;
  const createItem = useMutation(api.admin.golf_r.createItem);
  const updateItem = useMutation(api.admin.golf_r.updateItem);
  const attachmentDraft = useAttachmentDraft(item);

  return (
    <GolfItemForm.Form
      className="space-y-6"
      defaultValues={defaultValues(item)}
      disabled={attachmentDraft.isUploading}
      resetOnSuccess={false}
      submitLabel={item ? "Save record" : "Create record"}
      onSubmit={async (values) => {
        const attachments = attachmentDraft.attachments.map((attachment) => ({
          ...(attachment.contentType
            ? { contentType: attachment.contentType }
            : {}),
          name: attachment.name,
          storageId: attachment.storageId,
        }));
        const data = {
          attachments,
          cashback: values.cashback,
          category: values.category,
          date: values.date,
          description: values.description || undefined,
          discount: values.discount,
          installed: optionalBoolean(values.installed as BooleanChoice),
          mileage: values.mileage,
          modification: optionalBoolean(values.modification as BooleanChoice),
          name: values.name,
          price: values.price,
          url: values.url || undefined,
        };

        try {
          await (item
            ? updateItem({ id: item._id, ...data })
            : createItem(data));
          attachmentDraft.markCommitted();
          onDone();
          return {
            message: "Golf R record saved.",
            status: "success" as const,
          };
        } catch (error) {
          return formError(error);
        }
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <GolfItemForm.Field name="name" />
        <GolfItemForm.Field name="category" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <GolfItemForm.Field name="price" />
        <GolfItemForm.Field name="discount" />
        <GolfItemForm.Field name="cashback" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <GolfItemForm.Field name="date" />
        <GolfItemForm.Field name="mileage" />
      </div>

      <GolfItemForm.Field name="description" />
      <GolfItemForm.Field name="url" />

      <div className="grid gap-5 sm:grid-cols-2">
        <GolfItemForm.Field name="modification" />
        <GolfItemForm.Field name="installed" />
      </div>

      <AttachmentManager
        attachments={attachmentDraft.attachments}
        error={attachmentDraft.error}
        isUploading={attachmentDraft.isUploading}
        onRemove={attachmentDraft.handleRemoveAttachment}
        onUpload={attachmentDraft.handleUploadFiles}
      />

      <div className="flex justify-end border-t border-base-300 pt-5">
        <GolfItemForm.Submit />
      </div>
    </GolfItemForm.Form>
  );
}

function defaultValues(item?: GolfRItem) {
  return {
    cashback: item?.cashback,
    category: item?.category ?? "purchase",
    date: item?.date ?? localDateInputValue(),
    description: item?.description ?? "",
    discount: item?.discount,
    installed: booleanChoice(item?.installed ?? null),
    mileage: item?.mileage,
    modification: booleanChoice(item?.modification ?? null),
    name: item?.name ?? "",
    price: item?.price ?? 0,
    url: item?.url ?? "",
  };
}

function localDateInputValue() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}
