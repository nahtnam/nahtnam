import { lazy, Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AirportData, ArcData } from "@/lib/travel/types";

const FlightGlobeInner = lazy(async () => {
  const m = await import("./globe");
  return { default: m.FlightGlobeInner };
});

type FlightGlobeProps = {
  readonly airportPoints: AirportData[];
  readonly arcs: ArcData[];
};

export function FlightGlobe(props: FlightGlobeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Skeleton className="aspect-square w-full max-w-[600px] rounded-full" />
    );
  }

  return (
    <Suspense
      fallback={
        <Skeleton className="aspect-square w-full max-w-[600px] rounded-full" />
      }
    >
      <FlightGlobeInner airportPoints={props.airportPoints} arcs={props.arcs} />
    </Suspense>
  );
}
