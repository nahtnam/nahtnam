import { useMemo } from "react";
import { FlightRoutes, getAirportInfo } from "@/components/ui/flight";
import { Map } from "@/components/ui/map";
import type { ArcData } from "@/lib/travel/types";

const DURATION_PER_TWELVE_HOURS_MS = 5000;
const DELAY_PER_YEAR_MS = 5000;
const LOOP_ANIMATION = false;

type FlightGlobeInnerProps = {
  readonly arcs: ArcData[];
};

export function FlightGlobeInner(props: FlightGlobeInnerProps) {
  const { arcs } = props;
  const baseYear = useMemo(
    () => Math.min(...arcs.map((arc) => arc.year)),
    [arcs],
  );

  return (
    <Map
      className="aspect-square w-full max-w-[600px] overflow-hidden"
      center={[-100, 35]}
      projection={{ type: "globe" }}
      zoom={2}
    >
      <FlightRoutes
        showAirports
        showLabel
        color="#2563eb"
        routes={arcs.map((arc) => ({
          animate: {
            delay:
              getYearOffsetWithProgress({
                baseYear,
                date: arc.firstFlightDate,
              }) * DELAY_PER_YEAR_MS,
            duration: mapFlightTimeHoursToDurationMs({
              durationPerTwelveHoursMs: DURATION_PER_TWELVE_HOURS_MS,
              flightTimeHours:
                arc.tripType === "round-trip"
                  ? arc.flightTimeHours * 2
                  : arc.flightTimeHours,
            }),
            loop: LOOP_ANIMATION,
          },
          from: getAirportInfo(arc.startCode)
            ? arc.startCode
            : ([arc.startLng, arc.startLat] as [number, number]),
          to: getAirportInfo(arc.endCode)
            ? arc.endCode
            : ([arc.endLng, arc.endLat] as [number, number]),
          tripType: arc.tripType,
        }))}
        width={1.6}
      />
    </Map>
  );
}

type MapFlightTimeHoursToDurationMsOptions = {
  durationPerTwelveHoursMs: number;
  flightTimeHours: number;
};

function mapFlightTimeHoursToDurationMs(
  options: MapFlightTimeHoursToDurationMsOptions,
) {
  const { durationPerTwelveHoursMs, flightTimeHours } = options;
  return Math.round((flightTimeHours / 12) * durationPerTwelveHoursMs);
}

type GetYearOffsetWithProgressOptions = {
  baseYear: number;
  date: string;
};

function getYearOffsetWithProgress(options: GetYearOffsetWithProgressOptions) {
  const { baseYear, date } = options;
  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 0;
  }

  const year = parsedDate.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const startOfNextYear = Date.UTC(year + 1, 0, 1);
  const progressWithinYear =
    (parsedDate.getTime() - startOfYear) / (startOfNextYear - startOfYear);

  return year - baseYear + progressWithinYear;
}
