// src/utils/tripUtils.ts
import { Car } from '@/store/carSlice';

const KM_TO_MI = 0.621371;
const GALLON_TO_LITER = 3.78541;

export function kmToMiles(km: number) {
  return km * KM_TO_MI;
}

export function parseIntSafe(s?: string): number {
  if (!s) return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Cost = fuel used * price per liter (+ tolls)
 * Supports either car.consumption_l_100km (L/100km) or car.fuel_efficiency (mpg).
 * Returns undefined if we can’t compute (missing inputs).
 */
export function calculateTripCostFromKm(
  distanceKm: number | undefined,
  car: Car | undefined,
  fuelPricePerLiter?: number,
  tolls?: number
): number | undefined {
  if (!distanceKm || !car || !fuelPricePerLiter || fuelPricePerLiter <= 0) return undefined;

  const tollsCost = tolls && tolls > 0 ? tolls : 0;

  if (typeof car.consumption_l_100km === 'number' && car.consumption_l_100km > 0) {
    const liters = (distanceKm * car.consumption_l_100km) / 100.0;
    return liters * fuelPricePerLiter + tollsCost;
  }

  if (typeof car.fuel_efficiency === 'number' && car.fuel_efficiency > 0) {
    const miles = kmToMiles(distanceKm);
    const gallons = miles / car.fuel_efficiency;
    const liters = gallons * GALLON_TO_LITER;
    return liters * fuelPricePerLiter + tollsCost;
  }

  return undefined;
}

/** Share per person given total passengers (string) and cost. Driver counts as +1. */
export function calculateSharePerPerson(passengersStr: string | undefined, cost?: number): number {
  const totalPeople = parseIntSafe(passengersStr) + 1;
  if (!cost || totalPeople <= 0) return 0;
  return cost / totalPeople;
}

/** Example driver “savings”: cost - sharePerPerson. Adjust to your product logic. */
export function calculateDriverSavings(passengersStr: string | undefined, cost?: number): number {
  const per = calculateSharePerPerson(passengersStr, cost);
  return cost ? Math.max(cost - per, 0) : 0;
}
