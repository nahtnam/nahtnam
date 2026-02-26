import { createFileRoute } from "@tanstack/react-router";
import { ContactFooter } from "@/routes/-components/contact-footer";
import { ContactForm } from "@/routes/-components/contact-form";
import { ContactHeader } from "@/routes/-components/contact-header";

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
  head: () => ({
    meta: [
      {
        content: "Contact | Manthan (@nahtnam)",
        title: "Contact | Manthan (@nahtnam)",
      },
      {
        content:
          "Get in touch with Manthan (@nahtnam) - Principal Software Engineer at Mercury. Open to discussions about software engineering, startups, and opportunities.",
        name: "description",
      },
      {
        content: "Contact | Manthan (@nahtnam)",
        property: "og:title",
      },
      {
        content:
          "Get in touch with Manthan (@nahtnam) - Principal Software Engineer at Mercury. Open to discussions about software engineering, startups, and opportunities.",
        property: "og:description",
      },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-16">
      <ContactHeader />
      <ContactForm />
      <ContactFooter />
    </div>
  );
}
