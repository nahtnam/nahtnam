import { createFileRoute } from "@tanstack/react-router";
import { ContactFooter } from "@/routes/-components/contact-footer";
import { ContactForm } from "@/routes/-components/contact-form";
import { ContactHeader } from "@/routes/-components/contact-header";
import { createSeo, pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
  head: () => createSeo(pageSeo.contact),
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
