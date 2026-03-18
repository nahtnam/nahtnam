import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { BuildStats } from "./-components/build-stats";
import { CarHero } from "./-components/car-hero";
import { CostBreakdown } from "./-components/cost-breakdown";
import { sortGolfRItems } from "./-components/lib";
import { ModTimeline } from "./-components/mod-timeline";
import { VehicleLedger } from "./-components/vehicle-ledger";
import { appUrl } from "@/lib/config";

export const Route = createFileRoute("/golf-r/")({
  component: GolfRPage,
  head: () => ({
    links: [
      {
        href: `${appUrl}/golf-r`,
        rel: "canonical",
      },
    ],
    meta: [
      {
        content: "Golf R Build | Manthan (@nahtnam)",
        title: "Golf R Build | Manthan (@nahtnam)",
      },
      {
        content:
          "Tracking every mod, upgrade, and dollar spent on my 2026 Volkswagen Golf R in Pure White.",
        name: "description",
      },
      {
        content: `${appUrl}/golf-r`,
        property: "og:url",
      },
      {
        content: "Golf R Build | Manthan (@nahtnam)",
        property: "og:title",
      },
      {
        content:
          "Tracking every mod, upgrade, and dollar spent on my 2026 Volkswagen Golf R in Pure White.",
        property: "og:description",
      },
    ],
  }),
});

function GolfRPage() {
  const { data } = useSuspenseQuery(
    convexQuery(api.golf_r.queries.listItems, {}),
  );
  const items = sortGolfRItems(data);

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16">
      <CarHero />

      <div className="mt-10 space-y-8">
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
