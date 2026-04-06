export type AirportData = {
  iata: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
};

export type ArcData = {
  flightTimeHours: number;
  firstFlightDate: string;
  startLat: number;
  startLng: number;
  startCode: string;
  endLat: number;
  endLng: number;
  endCode: string;
  count: number;
  tripType: "one-way" | "round-trip";
  year: number;
};

export type TravelStats = {
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
