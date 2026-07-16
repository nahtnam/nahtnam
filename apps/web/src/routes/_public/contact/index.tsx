import { createForm } from "@formadapter/react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { clientEnv } from "@repo/config/env/client";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2Icon, LoaderCircleIcon, SendIcon } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";

import { createSeo, pageSeo } from "@/lib/seo";

// The field keys avoid the structural `Error` shape (`name` + `message`),
// which FormAdapter 0.0.1 intentionally treats as an atomic value.
const contactSchema = z.object({
  // FormAdapter 0.0.1 recognizes ZodString format checks, not z.email().
  // oxlint-disable-next-line react-doctor/zod-v4-prefer-top-level-string-formats
  senderEmail: z
    .string()
    .email("Enter a valid email address.")
    .max(320, "Enter a valid email address."),
  body: z
    .string()
    .trim()
    .min(1, "Enter a message.")
    .max(3000, "Keep your message under 3,000 characters."),
  senderName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Keep your name under 100 characters."),
});

const ContactFormModel = createForm(contactSchema).configure({
  fields: {
    body: {
      control: "textarea",
      controlProps: {
        className: "min-h-40 resize-y",
        rows: 6,
      },
      label: "Message",
      placeholder: "What's on your mind?",
    },
    senderEmail: {
      controlProps: {
        autoComplete: "email",
      },
      label: "Email",
      placeholder: "you@example.com",
    },
    senderName: {
      controlProps: {
        autoComplete: "name",
      },
      label: "Your name",
      placeholder: "What's your name?",
    },
  },
});

export const Route = createFileRoute("/_public/contact/")({
  component: ContactPage,
  head: () => createSeo(pageSeo.contact),
});

function ContactPage() {
  return (
    <div className="page-shell page-shell-wide">
      <div className="grid gap-12 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <header>
          <span className="route-kicker">Contact</span>
          <h1 className="heading mt-5 text-5xl sm:text-7xl">Say hello.</h1>
          <p className="mt-6 max-w-md text-pretty text-lg leading-8 text-base-content/70">
            I&apos;m always happy to chat about tech, life, or anything in
            between. Whether you want to grab coffee or just say hi, feel free
            to reach out.
          </p>
        </header>

        <ContactForm />
      </div>
    </div>
  );
}

function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileError, setTurnstileError] = useState<string>();
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const turnstileRef = useRef<TurnstileInstance>(null);

  if (isSubmitted) {
    return (
      <section aria-live="polite">
        <div className="alert alert-success alert-soft items-start">
          <CheckCircle2Icon className="mt-0.5 size-5" />
          <div>
            <h2 className="font-semibold">Message sent!</h2>
            <p className="mt-1 text-sm">
              Thanks for reaching out. I&apos;ll get back to you soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const resetChallenge = () => {
    turnstileRef.current?.reset();
    setTurnstileToken(undefined);
  };

  return (
    <section aria-labelledby="contact-form-heading">
      <div>
        <h2 className="heading text-3xl" id="contact-form-heading">
          Send a note
        </h2>
        <p className="muted mt-2">
          A short note is enough. I read every message.
        </p>
      </div>

      <ContactFormModel.Form
        className="mt-8"
        defaultValues={{ body: "", senderEmail: "", senderName: "" }}
        onResult={(result) => {
          resetChallenge();
          if (result.status === "success") {
            setIsSubmitted(true);
          }
        }}
        onSubmit={async (values, context) => {
          if (!turnstileToken) {
            return {
              errorKind: "business" as const,
              fieldErrors: {},
              formErrors: ["Complete the verification before sending."],
              status: "error" as const,
            };
          }

          try {
            const response = await fetch("/api/contact", {
              body: JSON.stringify({
                email: values.senderEmail,
                message: values.body,
                name: values.senderName,
                turnstileToken,
              }),
              headers: { "Content-Type": "application/json" },
              method: "POST",
              signal: context.signal,
            });
            const body = (await response.json()) as { error?: string };

            if (!response.ok) {
              return {
                errorKind: "business" as const,
                fieldErrors: {},
                formErrors: [
                  body.error ?? "Your message could not be sent. Try again.",
                ],
                status: "error" as const,
              };
            }

            return { message: "Message sent!", status: "success" as const };
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
              return;
            }

            return {
              errorKind: "transport" as const,
              fieldErrors: {},
              formErrors: [
                "The connection dropped before your message was sent. Try again.",
              ],
              status: "error" as const,
            };
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ContactFormModel.Field name="senderName" />
          <ContactFormModel.Field name="senderEmail" />
        </div>
        <ContactFormModel.Field name="body" />

        <div className="space-y-3">
          <Turnstile
            ref={turnstileRef}
            className={turnstileToken ? "hidden" : "max-w-full overflow-hidden"}
            options={{ action: "contact", size: "flexible" }}
            siteKey={clientEnv.VITE_TURNSTILE_SITE_KEY}
            onError={() => {
              setTurnstileError(
                "Verification could not load. Check your connection and try again."
              );
              setTurnstileToken(undefined);
            }}
            onExpire={() => {
              setTurnstileError(
                "Verification expired. Please complete it again."
              );
              setTurnstileToken(undefined);
            }}
            onSuccess={(token) => {
              setTurnstileError(undefined);
              setTurnstileToken(token);
            }}
          />
          {turnstileError ? (
            <div className="alert alert-error alert-soft" role="alert">
              <span>{turnstileError}</span>
            </div>
          ) : null}
        </div>

        <ContactSubmit isVerified={Boolean(turnstileToken)} />
      </ContactFormModel.Form>
    </section>
  );
}

type ContactSubmitProps = {
  readonly isVerified: boolean;
};

function ContactSubmit(props: ContactSubmitProps) {
  const { isVerified } = props;
  const { isSubmitting } = ContactFormModel.useFormState();

  return (
    <button
      className="btn btn-primary w-full justify-self-stretch sm:w-auto sm:justify-self-start"
      disabled={isSubmitting || !isVerified}
      type="submit"
    >
      {isSubmitting ? (
        <>
          <LoaderCircleIcon className="size-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <SendIcon className="size-4" />
          Send message
        </>
      )}
    </button>
  );
}
