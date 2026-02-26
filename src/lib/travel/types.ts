export type AirportData = {
  iata: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
};

export type ArcData = {
  animateTime: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  count: number;
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
