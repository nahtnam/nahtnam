import { createFileRoute } from "@tanstack/react-router";
import { H1 } from "@/components/ui/typography";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="container mx-auto my-8">
      <H1>Hello world!</H1>
    </div>
  );
}
