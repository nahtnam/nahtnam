export type AirportData = {
  city: string;
  country: string;
  iata: string;
  lat: number;
  lng: number;
};

export type ArcData = {
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

export type TravelStats = {
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
