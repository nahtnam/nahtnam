import { createFileRoute } from "@tanstack/react-router";
import { H1 } from "./-shadcn/components/ui/typography";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <div className="container mx-auto my-8">
      <H1>Hello world!</H1>
    </div>
  );
}
