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
};

export type MRequestStatus = "pending" | "approved" | "declined" | "cancelled" | "completed";

export type MRideRequest = {
  id: string;
  rideId: string;
  riderId: string;
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

export const currentUser: MUser = {
  id: "u1",
  avatar: "https://i.pravatar.cc/80?img=1",
  name: "Cindy",
  email: "cindy@example.com",
  driverRating: 4.9,
  driverReviewCount: 10,
  driverRidesCompleted: 72,
  riderRating: 4.8,
  riderReviewCount: 8,
  riderRidesCompleted: 54,
  driverReviews: [
    { id: "drv1", reviewer: "Maya", rating: 5, comment: "Very reliable driver and easy to coordinate with." },
    { id: "drv2", reviewer: "Alex", rating: 5, comment: "Clear pickup details and always on time." },
  ],
  riderReviews: [
    { id: "rdr1", reviewer: "Sarah", rating: 5, comment: "Respectful rider and ready on time." },
    { id: "rdr2", reviewer: "Nina", rating: 5, comment: "Great communication before the trip." },
  ],
};

export const initialUsers: MUser[] = [
  currentUser,
  {
    id: "u2",
    name: "Maya",
    email: "maya@example.com",
    avatar: "https://i.pravatar.cc/80?img=47",
    driverRating: 4.8,
    driverReviewCount: 14,
    driverRidesCompleted: 96,
    riderRating: 4.9,
    riderReviewCount: 10,
    riderRidesCompleted: 46,
    driverReviews: [
      { id: "drv3", reviewer: "Cindy", rating: 5, comment: "Friendly driver and smooth route planning." },
    ],
    riderReviews: [
      { id: "rdr3", reviewer: "Alex", rating: 5, comment: "Easy pickup and respectful rider." },
    ],
  },
  {
    id: "u3",
    name: "Alex",
    email: "alex@example.com",
    avatar: "https://i.pravatar.cc/80?img=12",
    driverRating: 4.7,
    driverReviewCount: 9,
    driverRidesCompleted: 51,
    riderRating: 4.8,
    riderReviewCount: 6,
    riderRidesCompleted: 36,
    driverReviews: [
      { id: "drv4", reviewer: "Maya", rating: 5, comment: "Good communication before the ride." },
    ],
    riderReviews: [
      { id: "rdr4", reviewer: "Sarah", rating: 5, comment: "Polite and punctual as a passenger." },
    ],
  },
  {
    id: "u4",
    name: "Ryan",
    email: "ryan@example.com",
    avatar: "https://i.pravatar.cc/80?img=33",
    driverRating: 4.6,
    driverReviewCount: 7,
    driverRidesCompleted: 38,
    riderRating: 4.7,
    riderReviewCount: 4,
    riderRidesCompleted: 25,
    driverReviews: [
      { id: "drv5", reviewer: "Sarah", rating: 4, comment: "Helpful and flexible with pickup location." },
    ],
    riderReviews: [
      { id: "rdr5", reviewer: "Nina", rating: 5, comment: "Respectful and quick to respond." },
    ],
  },
  {
    id: "u5",
    name: "Sarah",
    email: "sarah@example.com",
    avatar: "https://i.pravatar.cc/80?img=32",
    driverRating: 4.9,
    driverReviewCount: 20,
    driverRidesCompleted: 151,
    riderRating: 4.9,
    riderReviewCount: 11,
    riderRidesCompleted: 50,
    driverReviews: [
      { id: "drv6", reviewer: "Nina", rating: 5, comment: "Safe, punctual, and very considerate." },
    ],
    riderReviews: [
      { id: "rdr6", reviewer: "Ryan", rating: 5, comment: "Friendly rider and very organized." },
    ],
  },
  {
    id: "u6",
    name: "Nina",
    email: "nina@example.com",
    avatar: "https://i.pravatar.cc/80?img=5",
    driverRating: 4.8,
    driverReviewCount: 12,
    driverRidesCompleted: 74,
    riderRating: 4.9,
    riderReviewCount: 7,
    riderRidesCompleted: 44,
    driverReviews: [
      { id: "drv7", reviewer: "Ryan", rating: 5, comment: "Careful driver and easy route coordination." },
    ],
    riderReviews: [
      { id: "rdr7", reviewer: "Ryan", rating: 5, comment: "Great rider and very respectful." },
    ],
  },
];

export const initialGroups: MGroup[] = [
  {
    id: "office",
    name: "Office Buddies",
    route: "Home → Office",
    schedule: "Mon, Tue, Wed, Thu, Fri",
    description: "Coworkers and office commutes",
    memberIds: ["u2", "u3", "u4", "u6", "u5"],
    saved: 48.75,
  },
  {
    id: "gym",
    name: "Gym Crew",
    route: "Home → FitLife Gym",
    schedule: "Mon, Wed, Fri",
    description: "Friends who share gym routes",
    memberIds: ["u5", "u3", "u6", "u4", "u2"],
    saved: 22.5,
  },
  {
    id: "weekend",
    name: "Weekend Getaway",
    route: "Home → Hill View Resort",
    schedule: "Sat, Sun",
    description: "Weekend trips and events",
    memberIds: ["u2", "u4", "u5", "u3"],
    saved: 67.25,
  },
];

export const pinnedRideTemplates: MPinnedTemplate[] = [
  { id: "pin1", route: "Home → Office", schedule: "Weekdays · 8:00 AM", cost: 4.5 },
  { id: "pin2", route: "Home → Gym", schedule: "Mon, Wed, Fri · 6:30 PM", cost: 3.25 },
];

export const initialRides: MRide[] = [
  {
    id: "r1",
    groupId: "office",
    driverId: "u2",
    vehicle: "Honda Civic",
    origin: "Home",
    destination: "Office",
    departureTime: "8:00 AM",
    date: "Tomorrow",
    distance: "12.4 km",
    duration: "32 min",
    approximateCost: 4.5,
    seatsTotal: 4,
    passengerIds: ["u3", "u4"],
    seatsLeft: 1,
  },
  {
    id: "r2",
    groupId: "gym",
    driverId: "u5",
    vehicle: "Toyota Corolla",
    origin: "Home",
    destination: "FitLife Gym",
    departureTime: "6:30 PM",
    date: "Tomorrow",
    distance: "8.7 km",
    duration: "18 min",
    approximateCost: 3.25,
    seatsTotal: 4,
    passengerIds: ["u6", "u1"],
    seatsLeft: 1,
  },
  {
    id: "r3",
    groupId: null,
    driverId: "u3",
    vehicle: "Mazda 3",
    origin: "Home",
    destination: "Office",
    departureTime: "8:00 AM",
    date: "Tomorrow",
    distance: "12.4 km",
    duration: "32 min",
    approximateCost: 4.5,
    seatsTotal: 4,
    passengerIds: ["u4"],
    seatsLeft: 2,
  },
  {
    id: "r4",
    groupId: null,
    driverId: "u4",
    vehicle: "Hyundai Elantra",
    origin: "Home",
    destination: "City Center",
    departureTime: "6:30 PM",
    date: "Tomorrow",
    distance: "8.7 km",
    duration: "24 min",
    approximateCost: 3.75,
    seatsTotal: 4,
    passengerIds: [],
    seatsLeft: 3,
  },
];

export const pastTrips: MPastTrip[] = [
  { id: "p1", route: "Home → Office", date: "Yesterday", saved: 8.5 },
  { id: "p2", route: "Home → City Center", date: "May 22", saved: 6.25 },
];

export const carsOwned: MCarOwned[] = [
  { id: "c1", name: "Honda Civic", seats: 4, costPerKm: 0.18 },
  { id: "c2", name: "Toyota Corolla", seats: 4, costPerKm: 0.16 },
];

export const initialRideRequests: MRideRequest[] = [
  {
    id: "req-demo-pending",
    rideId: "r1",
    riderId: "u1",
    pickupPoint: "Bonaventure Station",
    dropoffPoint: "Office Tower Lobby",
    status: "pending",
    createdAt: "Today",
  },
  {
    id: "req-demo-approved",
    rideId: "r2",
    riderId: "u1",
    pickupPoint: "Longueuil Metro",
    dropoffPoint: "FitLife Gym entrance",
    status: "approved",
    createdAt: "Yesterday",
  },
  {
    id: "req-demo-declined",
    rideId: "r4",
    riderId: "u1",
    pickupPoint: "McGill Gate",
    dropoffPoint: "City Center",
    status: "declined",
    createdAt: "May 22",
  },
];

export const initialConfirmedRides: MConfirmation[] = [
  {
    id: "conf-demo",
    rideId: "r2",
    requestId: "req-demo-approved",
    riderId: "u1",
    pickupPoint: "Longueuil Metro",
    dropoffPoint: "FitLife Gym entrance",
    status: "confirmed",
    occupiedSeats: 2,
    messages: ["Driver approved your pickup point."],
    completionAsked: false,
    completed: false,
    reviewSubmitted: false,
  },
];

export const initialUpcomingTrips: MUpcomingTrip[] = [
  {
    id: "up1",
    kind: "rider",
    rideId: "r2",
    confirmationId: "conf-demo",
    route: "Home → FitLife Gym",
    date: "Tomorrow",
    time: "6:30 PM",
    cancellableUntil: "4:30 PM",
    canCancel: true,
  },
  {
    id: "up2",
    kind: "rider",
    rideId: "r1",
    route: "Home → Office",
    date: "Tomorrow",
    time: "8:00 AM",
    cancellableUntil: "6:00 AM",
    canCancel: true,
  },
];

export const DRIVER_CAR_CATALOG: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4"],
  Honda: ["Civic", "Accord", "CR-V"],
  Mazda: ["3", "CX-5"],
  Hyundai: ["Elantra", "Tucson"],
};

export const DRIVER_YEARS: string[] = Array.from({ length: 18 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

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
