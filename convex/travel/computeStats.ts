/* eslint-disable unicorn/filename-case */
import { airlines } from "./airlines";
import { airports, type AirportData } from "./airports";

const EARTH_RADIUS_MI = 3959;
const EARTH_CIRCUMFERENCE_MI = 24_901;
const EARTH_MOON_DISTANCE_MI = 238_900;
const AVG_FLIGHT_SPEED_MPH = 500;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

type HaversineOptions = {
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
};

function haversine(options: HaversineOptions): number {
  const { lat1, lng1, lat2, lng2 } = options;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const sinDlat = Math.sin(dLat / 2) ** 2;
  const cosProduct =
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const a = sinDlat + cosProduct;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

type Flight = {
  date: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  aircraftType: string;
};

type ArcData = {
  animateTime: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  count: number;
};

type TravelStats = {
  totalFlights: number;
  totalDistance: number;
  uniqueAirports: number;
  countries: number;
  flightsByYear: Record<string, number>;
  topAirlines: Array<{ name: string; count: number }>;
  topAirports: Array<{ code: string; city: string; count: number }>;
  aircraftTypes: string[];
  earthCircumnavigations: number;
  moonPercentage: number;
};

type ComputeResult = {
  stats: TravelStats;
  arcs: ArcData[];
  airportPoints: AirportData[];
};

export function computeStats(flights: Flight[]): ComputeResult {
  let totalDistance = 0;
  const visitedAirports = new Set<string>();
  const visitedCountries = new Set<string>();
  const yearCounts: Record<string, number> = {};
  const airlineCounts: Record<string, number> = {};
  const airportCounts: Record<string, number> = {};
  const aircraftSet = new Set<string>();
  const arcMap = new Map<string, ArcData>();

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
    yearCounts[year] = (yearCounts[year] || 0) + 1;

    const airlineName = airlines[flight.airline] || flight.airline;
    airlineCounts[airlineName] = (airlineCounts[airlineName] || 0) + 1;

    airportCounts[flight.from] = (airportCounts[flight.from] || 0) + 1;
    airportCounts[flight.to] = (airportCounts[flight.to] || 0) + 1;

    if (flight.aircraftType) {
      aircraftSet.add(flight.aircraftType);
    }

    const arcKey = [flight.from, flight.to].sort().join("-");
    const existing = arcMap.get(arcKey);
    if (existing) {
      existing.count += 1;
    } else {
      const flightTimeHours = distance / AVG_FLIGHT_SPEED_MPH;
      arcMap.set(arcKey, {
        animateTime: Math.round(flightTimeHours * 1000),
        count: 1,
        endLat: toAirport.lat,
        endLng: toAirport.lng,
        startLat: fromAirport.lat,
        startLng: fromAirport.lng,
      });
    }
  }

  const topAirlines = Object.entries(airlineCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ count, name }));

  const topAirports = Object.entries(airportCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, count]) => ({
      city: airports[code]?.city || code,
      code,
      count,
    }));

  const airportPoints = [...visitedAirports]
    .map((code) => airports[code])
    .filter((a): a is AirportData => a !== undefined);

  return {
    airportPoints,
    arcs: [...arcMap.values()],
    stats: {
      aircraftTypes: [...aircraftSet].sort(),
      countries: visitedCountries.size,
      earthCircumnavigations: Number.parseFloat(
        (totalDistance / EARTH_CIRCUMFERENCE_MI).toFixed(1),
      ),
      flightsByYear: yearCounts,
      moonPercentage: Number.parseFloat(
        ((totalDistance / EARTH_MOON_DISTANCE_MI) * 100).toFixed(1),
      ),
      topAirlines,
      topAirports,
      totalDistance: Math.round(totalDistance),
      totalFlights: flights.length,
      uniqueAirports: visitedAirports.size,
    },
  };
}
