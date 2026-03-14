import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { BuildStats } from "./-components/build-stats";
import { CarHero } from "./-components/car-hero";
import { CostBreakdown } from "./-components/cost-breakdown";
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
  const { data: items } = useSuspenseQuery(
    convexQuery(api.golfR.queries.listItems, {}),
  );

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <CarHero />

      <div className="mt-12 space-y-16">
        <BuildStats items={items} />
        <ModTimeline items={items} />
        <VehicleLedger items={items} />
        <CostBreakdown items={items} />
      </div>
    </div>
  );
}
