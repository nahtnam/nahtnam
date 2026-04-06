import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { FlightGlobe } from "./-components/flight-globe";
import { FlightStats } from "./-components/flight-stats";
import { H1 } from "@/components/ui/typography";
import { appUrl } from "@/lib/config";

export const Route = createFileRoute("/travel/")({
  component: TravelPage,
  head: () => ({
    links: [
      {
        href: `${appUrl}/travel`,
        rel: "canonical",
      },
    ],
    meta: [
      {
        content: "Travel | Manthan (@nahtnam)",
        title: "Travel | Manthan (@nahtnam)",
      },
      {
        content:
          "Flight history and travel stats of Manthan (@nahtnam) — airports visited, routes flown, and more.",
        name: "description",
      },
      {
        content: `${appUrl}/travel`,
        property: "og:url",
      },
      {
        content: "Travel | Manthan (@nahtnam)",
        property: "og:title",
      },
      {
        content:
          "Flight history and travel stats of Manthan (@nahtnam) — airports visited, routes flown, and more.",
        property: "og:description",
      },
    ],
  }),
});

function TravelPage() {
  const { data } = useSuspenseQuery(
    convexQuery(api.travel.queries.getStats, {}),
  );

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        <H1 className="font-semibold text-3xl">Travel</H1>
      </div>

      <div className="mb-10 flex justify-center">
        <FlightGlobe arcs={data.arcs} />
      </div>

      <FlightStats stats={data.stats} />
    </div>
  );
}
