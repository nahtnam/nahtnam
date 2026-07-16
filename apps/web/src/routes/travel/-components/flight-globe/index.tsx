import { lazy, Suspense, useSyncExternalStore } from "react";

import type { AirportData, ArcData } from "../types";

const FlightGlobeInner = lazy(async () => {
  const module = await import("./map");

  return { default: module.FlightGlobeInner };
});

type FlightGlobeProps = {
  airportPoints: AirportData[];
  arcs: ArcData[];
};

export function FlightGlobe(props: FlightGlobeProps) {
  const { airportPoints, arcs } = props;
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <FlightGlobeSkeleton />;
  }

  return (
    <Suspense fallback={<FlightGlobeSkeleton />}>
      <FlightGlobeInner airportPoints={airportPoints} arcs={arcs} />
    </Suspense>
  );
}

function FlightGlobeSkeleton() {
  return (
    <output
      aria-label="Loading flight map"
      className="skeleton aspect-[16/10] min-h-80 w-full rounded-box"
    />
  );
}

function subscribeToNothing() {
  return () => {
    // Client detection does not subscribe to an external store.
  };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}
