import { createFileRoute } from "@tanstack/react-router";
import { H1 } from "@/routes/-shadcn/components/ui/typography";
import { orpcTanstackQueryClient } from "@/server/client";
import { FlightGlobe } from "./-components/flight-globe";
import { FlightStats } from "./-components/flight-stats";

export const Route = createFileRoute("/travel/")({
  component: TravelPage,
  head: () => ({
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
  loader: ({ context }) =>
    context.queryClient.fetchQuery(
      orpcTanstackQueryClient.travel.getStats.queryOptions()
    ),
});

function TravelPage() {
  const data = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8">
        <H1 className="font-semibold text-3xl">Travel</H1>
      </div>

      <div className="mb-10 flex justify-center">
        <FlightGlobe airportPoints={data.airportPoints} arcs={data.arcs} />
      </div>

      <FlightStats stats={data.stats} />
    </div>
  );
}
