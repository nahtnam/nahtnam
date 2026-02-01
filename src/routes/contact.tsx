import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="font-bold text-4xl">Contact</h1>
      <p className="mt-4 text-muted-foreground">Coming soon...</p>
    </div>
  );
}
