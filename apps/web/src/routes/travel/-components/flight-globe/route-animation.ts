import type { ArcData } from "../types";
import { createRouteSegments } from "./route-geometry";
import type { Coordinate } from "./route-geometry";

const BASE_FLIGHT_YEAR = 2021;
const DELAY_PER_YEAR_MS = 500;
const MILLISECONDS_PER_FLIGHT_HOUR = 1400;
const ROUTE_WINDOW_RADIUS = 0.07;

type RouteDirection = "forward" | "reverse";

export type RouteAnimationState = {
  direction: RouteDirection;
  progress: number;
};

type AnimatedRouteFeature = {
  geometry: {
    coordinates: Coordinate[][];
    type: "MultiLineString";
  };
  properties: Record<string, never>;
  type: "Feature";
};

type CreateAnimatedRouteCollectionOptions = {
  arcs: ArcData[];
  elapsedMs: number;
};

export function createAnimatedRouteCollection(
  opts: CreateAnimatedRouteCollectionOptions
) {
  const { arcs, elapsedMs } = opts;
  const features = arcs.flatMap((arc): AnimatedRouteFeature[] => {
    const state = getRouteAnimationState({ arc, elapsedMs });

    if (!state) {
      return [];
    }

    const { direction, progress } = state;
    const from: Coordinate =
      direction === "forward"
        ? [arc.startLng, arc.startLat]
        : [arc.endLng, arc.endLat];
    const to: Coordinate =
      direction === "forward"
        ? [arc.endLng, arc.endLat]
        : [arc.startLng, arc.startLat];
    const windowStart = Math.max(0, progress - ROUTE_WINDOW_RADIUS);
    const windowEnd = Math.min(1, progress + ROUTE_WINDOW_RADIUS);
    const startCoordinate = interpolateRouteCoordinate({
      from,
      progress: windowStart,
      to,
    });
    const endCoordinate = interpolateRouteCoordinate({
      from,
      progress: windowEnd,
      to,
    });

    return [
      {
        geometry: {
          coordinates: createRouteSegments({
            from: startCoordinate,
            to: endCoordinate,
          }),
          type: "MultiLineString",
        },
        properties: {},
        type: "Feature",
      },
    ];
  });

  return {
    features,
    type: "FeatureCollection" as const,
  };
}

type GetRouteAnimationStateOptions = {
  arc: ArcData;
  elapsedMs: number;
};

export function getRouteAnimationState(
  opts: GetRouteAnimationStateOptions
): RouteAnimationState | null {
  const { arc, elapsedMs } = opts;
  const routeElapsedMs = elapsedMs - getRouteDelayMs({ year: arc.year });

  if (routeElapsedMs < 0) {
    return null;
  }

  const durationMs = getRouteDurationMs({
    flightTimeHours: arc.flightTimeHours,
  });

  if (arc.tripType === "one-way") {
    return {
      direction: "forward",
      progress: (routeElapsedMs % durationMs) / durationMs,
    };
  }

  const roundTripDurationMs = durationMs * 2;
  const roundTripElapsedMs = routeElapsedMs % roundTripDurationMs;

  if (roundTripElapsedMs < durationMs) {
    return {
      direction: "forward",
      progress: roundTripElapsedMs / durationMs,
    };
  }

  return {
    direction: "reverse",
    progress: (roundTripElapsedMs - durationMs) / durationMs,
  };
}

type GetRouteDelayOptions = {
  year: number;
};

export function getRouteDelayMs(opts: GetRouteDelayOptions) {
  const { year } = opts;

  return Math.max(0, year - BASE_FLIGHT_YEAR) * DELAY_PER_YEAR_MS;
}

type GetRouteDurationOptions = {
  flightTimeHours: number;
};

export function getRouteDurationMs(opts: GetRouteDurationOptions) {
  const { flightTimeHours } = opts;

  return Math.max(1, flightTimeHours * MILLISECONDS_PER_FLIGHT_HOUR);
}

type InterpolateRouteCoordinateOptions = {
  from: Coordinate;
  progress: number;
  to: Coordinate;
};

function interpolateRouteCoordinate(
  opts: InterpolateRouteCoordinateOptions
): Coordinate {
  const { from, progress, to } = opts;
  const [fromLongitude, fromLatitude] = from;
  const [toLongitude, toLatitude] = to;
  let longitudeDelta = toLongitude - fromLongitude;

  if (longitudeDelta > 180) {
    longitudeDelta -= 360;
  } else if (longitudeDelta < -180) {
    longitudeDelta += 360;
  }

  return [
    normalizeLongitude(fromLongitude + longitudeDelta * progress),
    fromLatitude + (toLatitude - fromLatitude) * progress,
  ];
}

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}
