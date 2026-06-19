/* eslint-disable sort-keys */
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { createConvexRouteQuery } from "convex-route-query";
import { FlightGlobe } from "./-components/flight-globe";
import { FlightStats } from "./-components/flight-stats";
import { H1, Lead } from "@/components/ui/typography";
import { createSeo, pageSeo } from "@/lib/seo";

const getStats = createConvexRouteQuery(api.travel.queries.getStats);

export const Route = createFileRoute("/travel/")({
  component: TravelPage,
  async loader({ context }) {
    await getStats.prefetchQuery(context.queryClient);
  },
  head: () => createSeo(pageSeo.travel),
});

function TravelPage() {
  const { data } = getStats.useSuspenseQuery();

  return (
    <div className="page-shell page-shell-wide max-w-5xl">
      <div className="page-intro">
        <span className="eyebrow mb-4">Flight Log</span>
        <H1>Travel</H1>
        <Lead className="mt-4 max-w-2xl text-base">
          A visual record of the routes, airports, and airlines that have made
          the world feel a little smaller over time.
        </Lead>
      </div>

      <div className="mb-10 flex justify-center overflow-hidden rounded-xl border border-border bg-card p-4">
        <FlightGlobe arcs={data.arcs} />
      </div>

      <FlightStats stats={data.stats} />
    </div>
  );
}
