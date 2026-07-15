import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_without-user/")({ component: App });

function App() {
  return (
    <div className="container mx-auto my-8">
      <h1 className="heading text-4xl">Hello world!</h1>
    </div>
  );
}
