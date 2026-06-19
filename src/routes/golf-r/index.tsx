/* eslint-disable sort-keys */
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { createConvexRouteQuery } from "convex-route-query";
import { BuildStats } from "./-components/build-stats";
import { CarHero } from "./-components/car-hero";
import { CostBreakdown } from "./-components/cost-breakdown";
import { sortGolfRItems } from "./-components/lib";
import { ModTimeline } from "./-components/mod-timeline";
import { VehicleLedger } from "./-components/vehicle-ledger";
import { createSeo, pageSeo } from "@/lib/seo";

const listItems = createConvexRouteQuery(api.golf_r.queries.listItems);

export const Route = createFileRoute("/golf-r/")({
  component: GolfRPage,
  async loader({ context }) {
    await listItems.prefetchQuery(context.queryClient);
  },
  head: () => createSeo(pageSeo.golfR),
});

function GolfRPage() {
  const { data } = listItems.useSuspenseQuery();
  const items = sortGolfRItems(data);

  return (
    <div className="page-shell page-shell-wide">
      <CarHero />

      <div className="mt-8 space-y-8">
        <BuildStats items={items} />

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <ModTimeline items={items} />
          <div className="space-y-8">
            <VehicleLedger items={items} />
            <CostBreakdown items={items} />
          </div>
        </div>
      </div>
    </div>
  );
}
