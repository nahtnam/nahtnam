import { lazy, Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/routes/-shadcn/components/ui/skeleton";
import type { AirportData, ArcData } from "../../-lib/types";

const FlightGlobeInner = lazy(() =>
  import("./globe").then((m) => ({ default: m.FlightGlobeInner }))
);

interface FlightGlobeProps {
  arcs: ArcData[];
  airportPoints: AirportData[];
}

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
