import { toMillis } from "@/assets/utils/conversion";
import { endOfMonth, endOfWeek, format, isWithinInterval, startOfMonth, startOfWeek } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { Car as CarIcon, DollarSign, PlusIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CarService, TripService, UserService } from "../../store/all";
import { setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";
import { setTrips } from "../../store/tripSlice";
import { UserState } from "../../store/userSlice";
const logoIcon = require("../../assets/images/Car_Auto.png");

// ✅ CAD currency formatter (always show cents)
const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const toNumber = (n: any) =>
  typeof n === "number" ? n : typeof n === "string" ? Number(n) || 0 : 0;

// ✅ Serialize any Firestore Timestamp/Date/string -> milliseconds (number)


const parseTripDate = (input: any): Date => {
  if (!input) return new Date(0);
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input); // ms from toMillis
  if (typeof input === "string") return new Date(input);
  if (typeof input === "object" && "seconds" in input)
    return new Date(input.seconds * 1000); // fallback if something slipped through
  return new Date(0);
};

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux-sourced data
  const trips = useSelector((s: RootState) => s.trip.trips);
  const cars = useSelector((s: RootState) => s.car.cars);

  // Local state
  const [user, setUser] = useState<UserState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  // Fetch data
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [userData, tripsData, carsData] = await Promise.all([
        UserService.me(),
        TripService.list("-created_date", 50),
        CarService.list(),
      ]);

      setUser(userData);

      if (tripsData) {
        const tripsSerialized = tripsData.map((t: any) => ({
          ...t,
          // normalize date-ish fields to ms (numbers)
          date: toMillis(t.date),
          createdAt: toMillis(t.createdAt),
          updatedAt: toMillis(t.updatedAt),
          savings: toNumber(t.savings),
        }));
        dispatch(setTrips(tripsSerialized));
      }

      if (carsData) {
        const carsSerialized = carsData.map((c: any) => ({
          ...c,
          createdAt: toMillis(c.createdAt), // 🔧 fixes RTK serializable warning
          updatedAt: toMillis(c.updatedAt),
          year: toNumber(c.year),
        }));
        dispatch(setCars(carsSerialized));
      }
    } finally {
      setRefreshing(false);
      setBootLoading(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  // Derived metrics
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const tripsThisMonth = useMemo(
    () =>
      trips.filter((t) =>
        isWithinInterval(parseTripDate(t.date), { start: monthStart, end: monthEnd })
      ),
    [trips]
  );

  const monthlySavings = useMemo(
    () => tripsThisMonth.reduce((sum, t) => sum + toNumber(t.savings), 0),
    [tripsThisMonth]
  );

  const totalSavings = useMemo(
    () => trips.reduce((sum, t) => sum + toNumber(t.savings), 0),
    [trips]
  );

  const tripsThisWeek = useMemo(
    () =>
      trips
        .filter((t) =>
          isWithinInterval(parseTripDate(t.date), { start: weekStart, end: weekEnd })
        )
        .sort(
          (a, b) => parseTripDate(b.date).getTime() - parseTripDate(a.date).getTime()
        ),
    [trips]
  );

  if (bootLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-black p-5"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} />}
    >
      {/* Header */}
      <View className="items-center mb-6">
        <View className="bg-main w-24 h-24 rounded-full justify-center items-center mb-8 mt-16">
          <Image source={logoIcon} style={{ width: 52, height: 52 }} resizeMode="contain" />
        </View>
        <Text className="text-white text-4xl font-bold mb-5">
          Hello {user?.full_name || ""},
        </Text>
        <Text className="text-gray-400 text-2xl">You’ve saved</Text>
        <Text className="text-4xl text-green-400 font-bold my-2">
          {currency.format(monthlySavings)}
        </Text>
        <Text className="text-gray-400 text-2xl mb-2">
          with {tripsThisMonth.length} CoTrip{tripsThisMonth.length === 1 ? "" : "s"} this month
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between space-x-4 gap-4">
        <View className="flex-1 bg-gray-900 rounded-xl p-5 items-center mb-5">
          <DollarSign color="#10B981" size={32} />
          <Text className="text-white text-2xl font-bold mt-2">
            {currency.format(totalSavings)}
          </Text>
          <Text className="text-gray-400 text-xl mt-1">Total Savings</Text>
        </View>
        <View className="flex-1 bg-gray-900 rounded-xl p-5 items-center mb-5">
          <CarIcon color="#10B981" size={32} />
          <Text className="text-white text-2xl font-bold mt-2">{cars.length}</Text>
          <Text className="text-gray-400 text-xl mt-1">Your Cars</Text>
        </View>
      </View>

      {/* This Week */}
      <View className="bg-gray-900 rounded-xl p-4 mb-2">
        <Text className="text-white text-xl font-bold mb-3">This week</Text>
        {tripsThisWeek.length > 0 ? (
          tripsThisWeek.slice(0, 5).map((trip) => {
            const d = parseTripDate(trip.date);
            return (
              <View key={trip.id} className="flex-row justify-between items-center mb-3">
                <View className="flex-1 pr-3">
                  <Text className="text-white">{format(d, "EEE, MMM d")}:</Text>
                  <Text className="text-gray-400 text-sm" numberOfLines={1}>
                    From {trip.from_location_name || trip.from_location} →{" "}
                    {trip.to_location_name || trip.to_location}
                  </Text>
                </View>
                <Text className="text-main font-semibold">
                  {currency.format(toNumber(trip.savings))}
                </Text>
              </View>
            );
          })
        ) : (
          <Text className="text-gray-400 text-lg">No trips yet this week</Text>
        )}
      </View>

      {/* Buttons */}
      <View className="flex-row justify-around p-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center px-1 py-3 bg-main rounded-lg mr-3"
          onPress={() => router.push("/(tabs)/trips")}
        >
          <PlusIcon className="w-5 h-5 mr-5" color="white" />
          <Text className="text-white text-xl ml-3 font-semibold">New Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center px-1 py-3 bg-main rounded-lg ml-3"
          onPress={() => router.push("/(tabs)/cars")}
        >
          <CarIcon className="w-6 h-6 mr-5" color="white" />
          <Text className="text-white text-xl ml-3 font-semibold">Add Car</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
