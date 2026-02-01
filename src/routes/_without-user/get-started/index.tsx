import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../-shadcn/components/ui/card";
import { Separator } from "../../-shadcn/components/ui/separator";
import { Google } from "./-components/google";

export const Route = createFileRoute("/_without-user/get-started/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex h-full flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
        </CardHeader>
        <Separator />
        <CardFooter>
          <Google />
        </CardFooter>
      </Card>
    </div>
  );
}
