// src/utils/computeTrip.ts
import { fetchCanadaGasPricePerLitre } from '@/assets/api/fuelPriceApi';
import { geocodeAddress, getRoute, routeByAddresses } from '@/assets/api/mapsApi';
import { Car } from '@/store/carSlice';

export type Coords = { lat: number; lng: number };

export const carLPerKm = (car?: Car): number => {
  const anyCar = car as any;
  if (typeof anyCar?.l_per_km === 'number') return anyCar.l_per_km;
  if (typeof car?.consumption_l_100km === 'number') return car.consumption_l_100km / 100;
  return 0.085; // fallback (~8.5 L/100km)
};

/**
 * One-way distance and fuel cost calculation.
 * - Resolves route using coords if provided, else by geocoding both addresses
 * - Gets CAD/L gas price (origin city → destination city → fallback)
 * - Returns resolved names + distance + litres + total cost (+ per person)
 */
export async function computeTripOneWay(args: {
  fromText: string;
  toText: string;
  car: Car;
  passengers?: number | string;
  fromCoords?: Coords | null;
  toCoords?: Coords | null;
}) {
  const { fromText, toText, car, passengers = 1, fromCoords, toCoords } = args;

  // 1) Route resolution
  let meters = 0;
  let fromResolved = '';
  let toResolved = '';

  if (fromCoords && toCoords) {
    const route = await getRoute(fromCoords, toCoords);
    meters = route.meters;
    fromResolved = fromText;
    toResolved = toText;
  } else if (fromCoords && !toCoords) {
    const to = await geocodeAddress(toText);
    const route = await getRoute(fromCoords, to.location);
    meters = route.meters;
    fromResolved = fromText;
    toResolved = to.formatted_address;
  } else if (!fromCoords && toCoords) {
    const from = await geocodeAddress(fromText);
    const route = await getRoute(from.location, toCoords);
    meters = route.meters;
    fromResolved = from.formatted_address;
    toResolved = toText;
  } else {
    const { from, to, route } = await routeByAddresses(fromText, toText);
    meters = route.meters;
    fromResolved = from.formatted_address;
    toResolved = to.formatted_address;
  }

  // 2) Distance (km) — one-way only
  const distanceKm = meters > 0 ? Number((meters / 1000).toFixed(2)) : 0;

  // 3) Gas price (origin → destination → fallback)
  let pricePerL = 1.70;
  try {
    const geoFrom = await geocodeAddress(fromResolved || fromText);
    pricePerL = await fetchCanadaGasPricePerLitre(geoFrom.city);
  } catch {
    try {
      const geoTo = await geocodeAddress(toResolved || toText);
      pricePerL = await fetchCanadaGasPricePerLitre(geoTo.city);
    } catch {
      /* keep fallback */
    }
  }

  // 4) Litres & cost
  const lpk = carLPerKm(car);
  const litres = distanceKm * lpk;
  const totalCost = litres * pricePerL;

  const pax = Math.max(1, parseInt(String(passengers || 1), 10));
  const totalPeople = pax + 1; // passengers + driver
  const costPerPerson = totalCost / totalPeople;

  return {
    fromResolved,
    toResolved,
    distanceKm: Number(distanceKm.toFixed(2)),
    litres: Number(litres.toFixed(2)),
    pricePerL: Number(pricePerL.toFixed(3)),
    totalCost: Number(totalCost.toFixed(2)),
    costPerPerson: Number(costPerPerson.toFixed(2)),
    passengers: String(pax),
  };
}
