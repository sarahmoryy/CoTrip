import { toMillis } from "@/assets/utils/conversion";
import {
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Car as CarIcon,
  DollarSign,
  Plus,
  TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { C, FONT } from "../../components/ui/theme";
import { CarService, TripService, UserService } from "../../store/all";
import { setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";
import { setTrips } from "../../store/tripSlice";
import { UserState } from "../../store/userSlice";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});
const toNumber = (n: any) =>
  typeof n === "number" ? n : typeof n === "string" ? Number(n) || 0 : 0;
const parseTripDate = (input: any): Date => {
  if (!input) return new Date(0);
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);
  if (typeof input === "string") return new Date(input);
  if (typeof input === "object" && "seconds" in input)
    return new Date(input.seconds * 1000);
  return new Date(0);
};

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const trips = useSelector((s: RootState) => s.trip.trips);
  const cars = useSelector((s: RootState) => s.car.cars);
  const [user, setUser] = useState<UserState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [userData, tripsData, carsData] = await Promise.all([
        UserService.me(),
        TripService.list("-created_date", 50),
        CarService.list(),
      ]);
      setUser(userData);
      if (tripsData)
        dispatch(
          setTrips(
            tripsData.map((t: any) => ({
              ...t,
              date: toMillis(t.date),
              createdAt: toMillis(t.createdAt),
              updatedAt: toMillis(t.updatedAt),
              savings: toNumber(t.savings),
            })),
          ),
        );
      if (carsData)
        dispatch(
          setCars(
            carsData.map((c: any) => ({
              ...c,
              createdAt: toMillis(c.createdAt),
              updatedAt: toMillis(c.updatedAt),
              year: toNumber(c.year),
            })),
          ),
        );
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
    }, [fetchAll]),
  );

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const tripsThisMonth = useMemo(
    () =>
      trips.filter((t) =>
        isWithinInterval(parseTripDate(t.date), {
          start: monthStart,
          end: monthEnd,
        }),
      ),
    [trips],
  );
  const monthlySavings = useMemo(
    () => tripsThisMonth.reduce((sum, t) => sum + toNumber(t.savings), 0),
    [tripsThisMonth],
  );
  const totalSavings = useMemo(
    () => trips.reduce((sum, t) => sum + toNumber(t.savings), 0),
    [trips],
  );
  const recentTrips = useMemo(
    () =>
      [...trips].sort(
        (a, b) =>
          parseTripDate(b.date).getTime() - parseTripDate(a.date).getTime(),
      ),
    [trips],
  );

  if (bootLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        paddingHorizontal: 20,
        paddingBottom: 32,
      }}
    >
      {/* Header */}
      <View style={{ paddingTop: 64, paddingBottom: 24 }}>
        <Text style={{ color: C.textMuted, fontSize: 14 }}>Welcome back,</Text>
        <Text
          style={{
            color: C.textPrimary,
            fontSize: 28,
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          {firstName} 👋
        </Text>
      </View>

      {/* Hero savings card */}
      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: 20,
          padding: 24,
          borderWidth: 0.5,
          borderColor: C.border,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <TrendingUp color={C.green} size={16} />
          <Text style={{ color: C.textMuted, fontSize: 13, marginLeft: 6 }}>
            Saved this month
          </Text>
        </View>
        <Text
          style={{
            color: C.green,
            fontSize: 40,
            fontWeight: "700",
            letterSpacing: -1,
          }}
        >
          {currency.format(monthlySavings)}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
          {tripsThisMonth.length} CoTrip{tripsThisMonth.length === 1 ? "" : "s"}{" "}
          this month
        </Text>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: C.surface,
            borderRadius: 16,
            padding: 18,
            borderWidth: 0.5,
            borderColor: C.border,
            alignItems: "center",
          }}
        >
          <DollarSign color={C.green} size={22} />
          <Text
            style={{
              color: C.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 8,
            }}
          >
            {currency.format(totalSavings)}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
            All-time savings
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: C.surface,
            borderRadius: 16,
            padding: 18,
            borderWidth: 0.5,
            borderColor: C.border,
            alignItems: "center",
          }}
        >
          <CarIcon color={C.green} size={22} />
          <Text
            style={{
              color: C.textPrimary,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 8,
            }}
          >
            {cars.length}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
            Your cars
          </Text>
        </View>
      </View>

      {/* Recent trips */}
      <View
        style={{
          flex: 1,
          backgroundColor: C.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 0.5,
          borderColor: C.border,
          marginBottom: 20,
        }}
      >
        <Text style={[FONT.sectionTitle, { marginBottom: 16 }]}>
          Recent trips
        </Text>
        {recentTrips.length > 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator
            indicatorStyle="white"
            persistentScrollbar
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchAll}
                tintColor={C.green}
              />
            }
          >
            {recentTrips.map((trip) => {
              const d = parseTripDate(trip.date);
              return (
                <View
                  key={trip.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: C.border,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text
                      style={{
                        color: C.textSecondary,
                        fontSize: 12,
                        marginBottom: 2,
                      }}
                    >
                      {format(d, "EEE, MMM d")}
                    </Text>
                    <Text
                      style={{ color: C.textPrimary, fontSize: 14 }}
                      numberOfLines={1}
                    >
                      {trip.from_location_name || trip.from_location} →{" "}
                      {trip.to_location_name || trip.to_location}
                    </Text>
                  </View>
                  <Text
                    style={{ color: C.green, fontSize: 14, fontWeight: "700" }}
                  >
                    {currency.format(toNumber(trip.savings))}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            No trips yet
          </Text>
        )}
      </View>

      {/* CTA buttons */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/trips")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 52,
            backgroundColor: C.greenDark,
            borderRadius: C.radius,
            gap: 8,
          }}
        >
          <Plus color="#fff" size={18} />
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
            New Trip
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/cars")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 52,
            backgroundColor: C.surface,
            borderRadius: C.radius,
            borderWidth: 1,
            borderColor: C.borderMid,
            gap: 8,
          }}
        >
          <CarIcon color={C.green} size={18} />
          <Text
            style={{ color: C.textPrimary, fontSize: 15, fontWeight: "600" }}
          >
            Add Car
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
