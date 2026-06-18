import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="font-serif text-8xl tracking-[-0.04em] text-primary/30">
        404
      </span>
      <div className="space-y-2">
        <h1 className="font-serif text-4xl tracking-[-0.03em]">Not Found</h1>
        <p className="text-muted-foreground">
          Could not find the requested resource.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          Return Home <ArrowRightIcon />
        </Link>
      </Button>
    </div>
  );
}
