import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";

import { createSeo, pageSeo } from "@/lib/seo";

import { BuildStats } from "./-components/build-stats";
import { CarHero } from "./-components/car-hero";
import { CostBreakdown } from "./-components/cost-breakdown";
import { sortGolfRItems } from "./-components/lib";
import { ModTimeline } from "./-components/mod-timeline";
import type { GolfRItem } from "./-components/types";
import { VehicleLedger } from "./-components/vehicle-ledger";

const listGolfRItems = createConvexRouteQuery(
  "listGolfRItems",
  api.golf_r.queries.listItems
);

export const Route = createFileRoute("/golf-r/")({
  loader: async (context) => ({
    ...(await listGolfRItems.prefetchRoute(context, {})),
  }),
  head: () => createSeo(pageSeo.golfR),
  component: GolfRPage,
});

function GolfRPage() {
  const { data } = listGolfRItems.useSuspenseRouteQuery(Route);
  const items = sortGolfRItems(data as GolfRItem[]);

  return (
    <div className="page-shell page-shell-wide">
      <CarHero />

      <div className="mt-8 space-y-16 lg:space-y-20">
        <BuildStats items={items} />
        <ModTimeline items={items} />
        <VehicleLedger items={items} />
        <CostBreakdown items={items} />
      </div>
    </div>
  );
}
