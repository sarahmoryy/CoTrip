// Client-side helpers that call your Supabase Edge Functions proxy.
// Your Google Maps API key stays hidden in Supabase (function secrets).

import { supabase } from '../../SupabaseConfig';

export type LatLng = { lat: number; lng: number };

export type PlacePrediction = {
  description: string;
  place_id: string;
};

async function getJSON<T>(path: string, params?: Record<string, string>): Promise<T> {
  const fnName = path.replace(/^\//, '');
  const { data, error } = await supabase.functions.invoke(fnName, {
    body: params ?? {},
  });
  if (error) throw new Error(error.message);
  return data as T;
}

/**
 * Autocomplete (for destination input).
 * Proxied by Firebase Function: /autocomplete
 */
export async function autocompletePlaces(input: string): Promise<PlacePrediction[]> {
  if (!input.trim()) return [];
  const data = await getJSON<{ predictions: PlacePrediction[] }>("/autocomplete", { input });
  return data.predictions ?? [];
}

/**
 * Resolve a place_id → { formatted_address, lat/lng }.
 * Proxied by: /placeDetails
 */
export async function placeDetails(
  placeId: string
): Promise<{ description: string; location: LatLng }> {
  const data = await getJSON<{ formatted_address: string; location: LatLng }>(
    "/placeDetails",
    { placeId }
  );
  return { description: data.formatted_address, location: data.location };
}

/**
 * Geocode a raw address → { formatted_address, lat/lng, city? }.
 * Proxied by: /geocode
 */
export async function geocodeAddress(
  address: string
): Promise<{ location: LatLng; formatted_address: string; city?: string }> {
  return await getJSON("/geocode", { address });
}

/**
 * Directions (driving) → { meters, seconds }.
 * Proxied by: /directions
 */
export async function getRoute(
  origin: LatLng,
  destination: LatLng
): Promise<{ meters: number; seconds: number }> {
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  return await getJSON("/directions", { origin: originStr, destination: destStr });
}

/**
 * Convenience: full flow with free-text addresses.
 */
export async function routeByAddresses(fromText: string, toText: string) {
  const [from, to] = await Promise.all([
    geocodeAddress(fromText),
    geocodeAddress(toText),
  ]);
  const route = await getRoute(from.location, to.location);
  return { from, to, route };
}
