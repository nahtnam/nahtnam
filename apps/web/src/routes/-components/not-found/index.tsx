import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

export function NotFound() {
  return (
    <div className="container mx-auto flex h-full flex-col items-center justify-center gap-5 text-center">
      <div className="space-y-2">
        <h1 className="heading text-4xl">Not Found</h1>
        <p className="muted text-lg">Could not find requested resource</p>
      </div>
      <Link className="btn btn-primary" to="/">
        Return Home <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
