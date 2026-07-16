import { airlines } from "./airlines";
import type { AirportData } from "./airports";
import { airports } from "./airports";

const EARTH_RADIUS_MI = 3959;
const EARTH_CIRCUMFERENCE_MI = 24_901;
const EARTH_MOON_DISTANCE_MI = 238_900;
const AVG_FLIGHT_SPEED_MPH = 500;

type Flight = {
  aircraftType: string;
  airline: string;
  date: string;
  flightNumber: string;
  from: string;
  to: string;
};

type ArcData = {
  count: number;
  endCode: string;
  endLat: number;
  endLng: number;
  firstFlightDate: string;
  flightTimeHours: number;
  startCode: string;
  startLat: number;
  startLng: number;
  tripType: "one-way" | "round-trip";
  year: number;
};

type TravelStats = {
  aircraftTypes: string[];
  countries: number;
  earthCircumnavigations: number;
  flightsByYear: Record<string, number>;
  moonPercentage: number;
  topAirlines: { count: number; name: string }[];
  topAirports: { city: string; code: string; count: number }[];
  totalDistance: number;
  totalFlights: number;
  uniqueAirports: number;
};

type ComputeStatsOptions = {
  flights: Flight[];
};

type HaversineOptions = {
  lat1: number;
  lat2: number;
  lng1: number;
  lng2: number;
};

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversine(options: HaversineOptions) {
  const { lat1, lat2, lng1, lng2 } = options;
  const latitudeDelta = toRadians(lat2 - lat1);
  const longitudeDelta = toRadians(lng2 - lng1);
  const latitudeTerm = Math.sin(latitudeDelta / 2) ** 2;
  const longitudeTerm =
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(latitudeTerm + longitudeTerm))
  );
}

export function computeStats(options: ComputeStatsOptions) {
  const { flights } = options;
  let totalDistance = 0;
  const visitedAirports = new Set<string>();
  const visitedCountries = new Set<string>();
  const yearCounts: Record<string, number> = {};
  const airlineCounts: Record<string, number> = {};
  const airportCounts: Record<string, number> = {};
  const aircraftSet = new Set<string>();
  const arcMap = new Map<string, ArcData>();
  const directionCounts = new Map<string, Map<string, number>>();

  for (const flight of flights) {
    const fromAirport = airports[flight.from];
    const toAirport = airports[flight.to];

    if (!(fromAirport && toAirport)) {
      continue;
    }

    const distance = haversine({
      lat1: fromAirport.lat,
      lat2: toAirport.lat,
      lng1: fromAirport.lng,
      lng2: toAirport.lng,
    });
    totalDistance += distance;
    visitedAirports.add(flight.from);
    visitedAirports.add(flight.to);
    visitedCountries.add(fromAirport.country);
    visitedCountries.add(toAirport.country);

    const year = flight.date.slice(0, 4);
    yearCounts[year] = (yearCounts[year] ?? 0) + 1;

    const airlineName = airlines[flight.airline] ?? flight.airline;
    airlineCounts[airlineName] = (airlineCounts[airlineName] ?? 0) + 1;
    airportCounts[flight.from] = (airportCounts[flight.from] ?? 0) + 1;
    airportCounts[flight.to] = (airportCounts[flight.to] ?? 0) + 1;

    if (flight.aircraftType) {
      aircraftSet.add(flight.aircraftType);
    }

    const arcKey = [flight.from, flight.to].toSorted().join("-");
    const directionKey = `${flight.from}-${flight.to}`;
    const directions = directionCounts.get(arcKey) ?? new Map<string, number>();
    directions.set(directionKey, (directions.get(directionKey) ?? 0) + 1);
    directionCounts.set(arcKey, directions);

    const existing = arcMap.get(arcKey);

    if (existing) {
      existing.count += 1;

      if (flight.date < existing.firstFlightDate) {
        existing.firstFlightDate = flight.date;
      }

      existing.year = Math.min(existing.year, Math.trunc(Number(year)));
    } else {
      arcMap.set(arcKey, {
        count: 1,
        endCode: flight.to,
        endLat: toAirport.lat,
        endLng: toAirport.lng,
        firstFlightDate: flight.date,
        flightTimeHours: distance / AVG_FLIGHT_SPEED_MPH,
        startCode: flight.from,
        startLat: fromAirport.lat,
        startLng: fromAirport.lng,
        tripType: "one-way",
        year: Math.trunc(Number(year)),
      });
    }
  }

  const topAirlines = Object.entries(airlineCounts)
    .toSorted((left, right) => right[1] - left[1])
    .map(([name, count]) => ({ count, name }));
  const topAirports = Object.entries(airportCounts)
    .toSorted((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([code, count]) => ({
      city: airports[code]?.city ?? code,
      code,
      count,
    }));
  const airportPoints = [...visitedAirports]
    .map((code) => airports[code])
    .filter((airport): airport is AirportData => airport !== undefined);
  const arcs = [...arcMap.entries()].map(([arcKey, arc]) => {
    const directions = directionCounts.get(arcKey);
    const hasOutbound =
      directions?.has(`${arc.startCode}-${arc.endCode}`) ?? false;
    const hasReturn =
      directions?.has(`${arc.endCode}-${arc.startCode}`) ?? false;

    return {
      ...arc,
      tripType:
        hasOutbound && hasReturn
          ? ("round-trip" as const)
          : ("one-way" as const),
    };
  });
  const stats: TravelStats = {
    aircraftTypes: [...aircraftSet].toSorted(),
    countries: visitedCountries.size,
    earthCircumnavigations: Number(
      (totalDistance / EARTH_CIRCUMFERENCE_MI).toFixed(1)
    ),
    flightsByYear: yearCounts,
    moonPercentage: Number(
      ((totalDistance / EARTH_MOON_DISTANCE_MI) * 100).toFixed(1)
    ),
    topAirlines,
    topAirports,
    totalDistance: Math.round(totalDistance),
    totalFlights: flights.length,
    uniqueAirports: visitedAirports.size,
  };

  return { airportPoints, arcs, stats };
}
