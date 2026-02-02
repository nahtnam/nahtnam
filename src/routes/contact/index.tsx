import { createFileRoute } from "@tanstack/react-router";
import { ContactFooter } from "@/routes/-components/contact-footer";
import { ContactForm } from "@/routes/-components/contact-form";
import { ContactHeader } from "@/routes/-components/contact-header";

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
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
