import maplibregl from "maplibre-gl";
import type {
  ExpressionSpecification,
  GeoJSONSource,
  StyleSpecification,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import type { AirportData, ArcData } from "../types";
import { createAnimatedRouteCollection } from "./route-animation";
import { createRouteSegments } from "./route-geometry";
import type { Coordinate } from "./route-geometry";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const ROUTE_COLOR = "#4f46e5";
const ROUTE_TRANSPARENT = "rgba(79, 70, 229, 0)";
const ROUTE_TRAIL = "rgba(79, 70, 229, 0.78)";
const ROUTE_SOURCE_ID = "travel-routes";
const ROUTE_LAYER_ID = "travel-route-lines";
const ROUTE_FLIGHT_SOURCE_ID = "travel-route-flight-segments";
const ROUTE_FLIGHT_LAYER_ID = "travel-route-flights";
const AIRPORT_SOURCE_ID = "travel-airports";
const AIRPORT_LAYER_ID = "travel-airport-points";
const AIRPORT_LABEL_LAYER_ID = "travel-airport-labels";
const EMPTY_ROUTE_COLLECTION = {
  features: [],
  type: "FeatureCollection" as const,
};
const ROUTE_FLIGHT_GRADIENT: ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["line-progress"],
  0,
  ROUTE_TRANSPARENT,
  0.12,
  ROUTE_TRAIL,
  0.5,
  ROUTE_COLOR,
  0.88,
  ROUTE_TRAIL,
  1,
  ROUTE_TRANSPARENT,
];

type FlightGlobeInnerProps = {
  airportPoints: AirportData[];
  arcs: ArcData[];
};

type RouteFeature = {
  geometry: {
    coordinates: Coordinate[][];
    type: "MultiLineString";
  };
  properties: Record<string, never>;
  type: "Feature";
};

type AirportFeature = {
  geometry: {
    coordinates: Coordinate;
    type: "Point";
  };
  properties: {
    code: string;
  };
  type: "Feature";
};

export function FlightGlobeInner(props: FlightGlobeInnerProps) {
  const { airportPoints, arcs } = props;
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    let animationFrameId: number | undefined;
    let animationStartedAt: number | undefined;

    if (!container || arcs.length === 0) {
      return;
    }

    const map = new maplibregl.Map({
      attributionControl: false,
      center: [-100, 35],
      container,
      zoom: 1.65,
    });
    const attribution = new maplibregl.AttributionControl({ compact: true });
    const navigation = new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true,
    });

    map.addControl(navigation, "top-right");
    map.addControl(attribution, "bottom-right");

    function handleStyleLoad() {
      map.addSource(ROUTE_SOURCE_ID, {
        data: createRouteCollection({ arcs }),
        type: "geojson",
      });
      map.addSource(ROUTE_FLIGHT_SOURCE_ID, {
        data: EMPTY_ROUTE_COLLECTION,
        lineMetrics: true,
        type: "geojson",
      });
      map.addSource(AIRPORT_SOURCE_ID, {
        data: createAirportCollection({ airportPoints }),
        type: "geojson",
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ROUTE_COLOR,
          "line-opacity": 0.22,
          "line-width": 1.25,
        },
        source: ROUTE_SOURCE_ID,
        type: "line",
      });
      map.addLayer({
        id: ROUTE_FLIGHT_LAYER_ID,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-gradient": ROUTE_FLIGHT_GRADIENT,
          "line-width": 2.6,
        },
        source: ROUTE_FLIGHT_SOURCE_ID,
        type: "line",
      });
      map.addLayer({
        id: AIRPORT_LAYER_ID,
        paint: {
          "circle-color": "#111827",
          "circle-radius": 3,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
        source: AIRPORT_SOURCE_ID,
        type: "circle",
      });
      map.addLayer({
        id: AIRPORT_LABEL_LAYER_ID,
        layout: {
          "text-allow-overlap": false,
          "text-field": ["get", "code"],
          "text-font": ["Open Sans Regular"],
          "text-offset": [0, 1.1],
          "text-size": 10,
        },
        paint: {
          "text-color": "#111827",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
        source: AIRPORT_SOURCE_ID,
        type: "symbol",
      });

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animationFrameId = requestAnimationFrame(animateRoutes);
      }
    }

    function animateRoutes(timestamp: number) {
      const flightSource = map.getSource(
        ROUTE_FLIGHT_SOURCE_ID
      ) as GeoJSONSource | null;

      if (!flightSource) {
        return;
      }

      animationStartedAt ??= timestamp;
      flightSource.setData(
        createAnimatedRouteCollection({
          arcs,
          elapsedMs: timestamp - animationStartedAt,
        })
      );
      animationFrameId = requestAnimationFrame(animateRoutes);
    }

    map.once("style.load", handleStyleLoad);
    map.setStyle(MAP_STYLE, { transformStyle: addGlobeProjection });

    return () => {
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
      map.off("style.load", handleStyleLoad);
      map.remove();
    };
  }, [airportPoints, arcs]);

  return (
    <div className="relative aspect-[16/10] min-h-80 w-full overflow-hidden rounded-box bg-base-200">
      <section
        aria-label="Interactive globe showing flight routes"
        className="h-full w-full"
        ref={containerRef}
      />
      <div className="pointer-events-none absolute top-4 left-4 rounded-field border border-base-300 bg-base-100/90 px-3 py-2 font-mono text-[0.65rem] tracking-[0.16em] text-base-content/65 uppercase backdrop-blur">
        Drag to rotate · scroll to zoom
      </div>
    </div>
  );
}

function addGlobeProjection(
  _previousStyle: StyleSpecification | undefined,
  nextStyle: StyleSpecification
) {
  return {
    ...nextStyle,
    projection: { type: "globe" as const },
  };
}

type CreateRouteCollectionOptions = {
  arcs: ArcData[];
};

function createRouteCollection(opts: CreateRouteCollectionOptions) {
  const { arcs } = opts;
  const features: RouteFeature[] = arcs.map((arc) => ({
    geometry: {
      coordinates: createRouteSegments({
        from: [arc.startLng, arc.startLat],
        to: [arc.endLng, arc.endLat],
      }),
      type: "MultiLineString",
    },
    properties: {},
    type: "Feature",
  }));

  return {
    features,
    type: "FeatureCollection" as const,
  };
}

type CreateAirportCollectionOptions = {
  airportPoints: AirportData[];
};

function createAirportCollection(opts: CreateAirportCollectionOptions) {
  const { airportPoints } = opts;
  const features: AirportFeature[] = airportPoints.map((airport) => ({
    geometry: {
      coordinates: [airport.lng, airport.lat],
      type: "Point",
    },
    properties: { code: airport.iata },
    type: "Feature",
  }));

  return {
    features,
    type: "FeatureCollection" as const,
  };
}
