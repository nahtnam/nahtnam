import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

export function NotFound() {
  return (
    <div className="page-shell page-shell-article grid min-h-[60vh] content-center">
      <section className="grid gap-8 border-y border-base-300 py-12 sm:grid-cols-[7rem_minmax(0,1fr)] sm:py-16">
        <span className="route-kicker pt-2">404</span>
        <div>
          <h1 className="heading text-5xl sm:text-6xl">Not Found</h1>
          <p className="muted mt-4 text-lg leading-8">
            Could not find the requested resource.
          </p>
          <Link className="btn btn-primary mt-8" to="/">
            Return Home <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
