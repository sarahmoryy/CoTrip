// src/services/mapsApi.ts
// Google Maps API helpers (LOCAL TESTING ONLY).
// For production: move behind Firebase Functions and restrict the API key.

export type LatLng = { lat: number; lng: number };

export type PlacePrediction = {
  description: string;
  place_id: string;
};

// Use Expo public env var during dev (set EXPO_PUBLIC_MAPS_API_KEY in .env)
const MAPS_API_KEY =
  process.env.EXPO_PUBLIC_MAPS_API_KEY || "AIzaSyB5JJrjj_JNjJ-_Al1QdGEqSWF52nhZeFw";

// if (!MAPS_API_KEY || MAPS_API_KEY.includes("PASTE")) {
//   console.warn(
//     "[mapsApi] Missing MAPS_API_KEY. Set EXPO_PUBLIC_MAPS_API_KEY in .env for local testing."
//   );
// }

/**
 * Autocomplete (for destination input).
 * Returns a list of predictions with description + place_id.
 */
export async function autocompletePlaces(
  input: string
): Promise<PlacePrediction[]> {
  if (!input.trim()) return [];
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&types=geocode&key=${MAPS_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(json.error_message || `Places autocomplete failed: ${json.status}`);
  }

  return (json.predictions ?? []).map((p: any) => ({
    description: p.description,
    place_id: p.place_id,
  }));
}

/**
 * Resolve a place_id → { formatted_address, lat/lng }.
 */
export async function placeDetails(
  placeId: string
): Promise<{ description: string; location: LatLng }> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry/location&key=${MAPS_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK") {
    throw new Error(json.error_message || `Place details failed: ${json.status}`);
  }

  return {
    description: json.result.formatted_address,
    location: json.result.geometry.location,
  };
}

/**
 * Fallback: geocode a raw address string → { formatted_address, lat/lng }.
 */
export async function geocodeAddress(
  address: string
): Promise<{ location: LatLng; formatted_address: string }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${MAPS_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK" || !json.results?.length) {
    const msg = json.error_message || `Geocoding failed: ${json.status}`;
    throw new Error(msg);
  }

  const r = json.results[0];
  return {
    location: r.geometry.location,
    formatted_address: r.formatted_address,
  };
}

/**
 * Directions (driving).
 * Returns distance (meters) + duration (seconds).
 */
export async function getRoute(
  origin: LatLng,
  destination: LatLng
): Promise<{ meters: number; seconds: number }> {
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    originStr
  )}&destination=${encodeURIComponent(destStr)}&mode=driving&key=${MAPS_API_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK") {
    throw new Error(json.error_message || `Directions failed: ${json.status}`);
  }

  const leg = json.routes?.[0]?.legs?.[0];
  return {
    meters: leg?.distance?.value ?? 0,
    seconds: leg?.duration?.value ?? 0,
  };
}

/**
 * Convenience: full flow with free-text addresses.
 * Geocode both, then fetch route.
 */
export async function routeByAddresses(fromText: string, toText: string) {
  const [from, to] = await Promise.all([
    geocodeAddress(fromText),
    geocodeAddress(toText),
  ]);
  const route = await getRoute(from.location, to.location);

  return { from, to, route };
}
