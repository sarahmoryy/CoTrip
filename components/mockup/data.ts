export type MUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  driverRating: number;
  driverReviewCount: number;
  driverRidesCompleted: number;
  riderRating: number;
  riderReviewCount: number;
  riderRidesCompleted: number;
  driverReviews: { id: string; reviewer: string; rating: number; comment: string }[];
  riderReviews: { id: string; reviewer: string; rating: number; comment: string }[];
};

export type MGroup = {
  id: string;
  name: string;
  route: string;
  schedule: string;
  description: string;
  memberIds: string[];
  saved: number;
};

export type MRide = {
  id: string;
  groupId: string | null;
  driverId: string;
  vehicle: string;
  origin: string;
  destination: string;
  departureTime: string;
  date: string;
  distance: string;
  duration: string;
  approximateCost: number;
  seatsTotal: number;
  passengerIds: string[];
  seatsLeft: number;
  completed?: boolean;
};

export type MRequestStatus = "pending" | "approved" | "declined" | "cancelled" | "completed";

export type MRideRequest = {
  id: string;
  rideId: string;
  riderId: string;
  riderName?: string;
  pickupPoint: string;
  dropoffPoint: string;
  status: MRequestStatus;
  createdAt: string;
  expectedTotalCost?: number;
  maxCost?: number;
  maxCostLow?: number;
  maxCostHigh?: number;
  gasVarPct?: number;
};

export type MConfirmation = {
  id: string;
  rideId: string;
  requestId: string;
  riderId: string;
  pickupPoint: string;
  dropoffPoint: string;
  status: "confirmed" | "cancelled" | "completed";
  occupiedSeats: number;
  messages: string[];
  completionAsked: boolean;
  completed: boolean;
  reviewSubmitted: boolean;
};

export type MUpcomingTrip = {
  id: string;
  kind: "rider" | "driver";
  rideId?: string;
  confirmationId?: string;
  driverTripId?: string;
  route: string;
  date: string;
  time: string;
  cancellableUntil: string;
  canCancel: boolean;
};

export type MNotification = { id: string; title: string; body: string; at: string; read: boolean };

export type MCarOwned = { id: string; name: string; seats: number; costPerKm: number };

export type MPastTrip = { id: string; route: string; date: string; saved: number };

export type MPinnedTemplate = { id: string; route: string; schedule: string; cost: number };

export type MDriverCar = {
  id: string;
  make: string;
  model: string;
  year: string;
  consumptionLPer100: number;
};

export type MDriverFolder = { id: string; name: string; memberIds: string[] };

export type MDriverTrip = {
  id: string;
  origin: string;
  destination: string;
  carId: string;
  carLabel: string;
  consumptionLPer100: number;
  distanceKm: number;
  totalCost: number;
  driverSavings: number;
  perRiderCost: number;
  createdAt: string;
  folderId: string;
  recipientIds: string[];
  paidById: Record<string, boolean>;
  ratingsById: Record<string, { rating: number; comment: string; at: string }>;
};


export const DRIVER_GAS_PRICE_PER_L = 1.7;
export const RIDER_GAS_VARIATION_PCT = 0.12;

export function driverMoney(value: number | string | undefined | null): string {
  const n = Number(value || 0);
  return `$${n.toFixed(2)}`;
}

export function driverId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function driverEstimateDistanceKm(origin: string, destination: string): number {
  const o = String(origin || "").toLowerCase();
  const d = String(destination || "").toLowerCase();
  if (o.includes("home") && d.includes("office")) return 12.4;
  if (d.includes("gym") || d.includes("fitlife")) return 8.7;
  if (d.includes("city") || d.includes("center")) return 8.7;
  if (o && d) return 10.0;
  return 0;
}

export function computeDriverTripCosts({
  distanceKm,
  consumptionLPer100,
  riderCount,
}: {
  distanceKm: number;
  consumptionLPer100: number;
  riderCount: number;
}) {
  const dist = Math.max(Number(distanceKm || 0), 0);
  const cons = Math.max(Number(consumptionLPer100 || 0), 0);
  const riders = Math.max(Number(riderCount || 0), 0);
  const litres = (dist * cons) / 100;
  const totalCost = litres * DRIVER_GAS_PRICE_PER_L;
  const totalPeople = riders + 1;
  const perPerson = totalPeople > 0 ? totalCost / totalPeople : totalCost;
  return {
    totalCost,
    perRider: perPerson,
    driverSavings: totalCost - perPerson,
  };
}

export function findUser(users: MUser[], userId: string): MUser {
  return (
    users.find((u) => u.id === userId) || {
      id: userId,
      name: "Unknown user",
      email: "",
      avatar: "https://i.pravatar.cc/80?u=unknown",
      driverRating: 0,
      driverReviewCount: 0,
      driverRidesCompleted: 0,
      riderRating: 0,
      riderReviewCount: 0,
      riderRidesCompleted: 0,
      driverReviews: [],
      riderReviews: [],
    }
  );
}
