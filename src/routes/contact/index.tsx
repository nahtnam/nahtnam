import { createFileRoute } from "@tanstack/react-router";
import { appUrl } from "@/lib/config";
import { ContactFooter } from "@/routes/-components/contact-footer";
import { ContactForm } from "@/routes/-components/contact-form";
import { ContactHeader } from "@/routes/-components/contact-header";

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
  head: () => ({
    links: [
      {
        href: `${appUrl}/contact`,
        rel: "canonical",
      },
    ],
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
        content: `${appUrl}/contact`,
        property: "og:url",
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
    <div className="page-shell page-shell-narrow">
      <ContactHeader />
      <ContactForm />
      <ContactFooter />
    </div>
  );
}
