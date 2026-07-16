import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";

import { createSeo, pageSeo } from "@/lib/seo";

import { FlightGlobe } from "./-components/flight-globe";
import {
  FlightStats,
  TravelScaleStats,
  TravelSummary,
} from "./-components/flight-stats";

const getTravelStats = createConvexRouteQuery(
  "getTravelStats",
  api.travel.queries.getStats
);

export const Route = createFileRoute("/travel/")({
  loader: async (context) => ({
    ...(await getTravelStats.prefetchRoute(context, {})),
  }),
  head: () => createSeo(pageSeo.travel),
  component: TravelPage,
});

function TravelPage() {
  const { data } = getTravelStats.useSuspenseRouteQuery(Route);

  return (
    <div className="page-shell page-shell-wide">
      <header className="page-intro grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="route-kicker">Flight log · Route atlas</p>
          <h1 className="heading mt-4 text-5xl sm:text-6xl">Travel</h1>
          <p className="muted mt-5 max-w-2xl text-lg leading-8">
            A visual record of the routes, airports, and airlines that have made
            the world feel a little smaller over time.
          </p>
        </div>
        <TravelScaleStats stats={data.stats} />
      </header>

      <section
        aria-labelledby="flight-map-heading"
        className="mt-10 border-y border-base-300 py-5"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="route-kicker">Layer 01 · Routes</p>
            <h2 className="heading mt-2 text-2xl" id="flight-map-heading">
              Flight paths over time
            </h2>
          </div>
          <span className="badge badge-outline font-mono">
            {data.arcs.length} unique routes
          </span>
        </div>
        {data.arcs.length > 0 ? (
          <FlightGlobe airportPoints={data.airportPoints} arcs={data.arcs} />
        ) : (
          <div className="alert">
            <span>No flight routes have been logged yet.</span>
          </div>
        )}
        <TravelSummary stats={data.stats} />
      </section>

      <div className="mt-14">
        <FlightStats stats={data.stats} />
      </div>
    </div>
  );
}
