import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { FlightGlobe } from "./-components/flight-globe";
import { FlightStats } from "./-components/flight-stats";
import { H1, Lead } from "@/components/ui/typography";
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
    <div className="page-shell page-shell-wide max-w-5xl">
      <div className="page-intro mb-8">
        <span className="eyebrow mb-4">Flight Log</span>
        <H1>Travel</H1>
        <Lead className="mt-4 max-w-2xl text-base">
          A visual record of the routes, airports, and airlines that have made
          the world feel a little smaller over time.
        </Lead>
      </div>

      <div className="section-card mb-10 flex justify-center overflow-hidden">
        <FlightGlobe arcs={data.arcs} />
      </div>

      <div className="section-card">
        <FlightStats stats={data.stats} />
      </div>
    </div>
  );
}
