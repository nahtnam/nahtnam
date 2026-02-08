export interface Flight {
  date: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  aircraftType: string;
}

export interface AirportData {
  iata: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export interface ArcData {
  animateTime: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  count: number;
}

export interface TravelStats {
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
}
