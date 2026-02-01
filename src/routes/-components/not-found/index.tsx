import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/routes/-shadcn/components/ui/button";
import { H1, Lead } from "@/routes/-shadcn/components/ui/typography";

export function NotFound() {
  return (
    <div className="container mx-auto flex h-full flex-col items-center justify-center space-y-4">
      <H1>Not Found</H1>
      <Lead>Could not find requested resource</Lead>
      <Button nativeButton={false} render={<Link to="/" />}>
        Return Home <ArrowRightIcon />
      </Button>
    </div>
  );
}
