import LocationEditor from "@/components/trips/LocationEditor";
import SimplifiedTripForm from "@/components/trips/SimplifiedTripForm";
import TripCard from "@/components/trips/TripCard";
import TripConfirmation from "@/components/trips/TripConfirmation";
import TripDetails from "@/components/trips/TripDetails";
import { DollarSign, MapPin, Plus, TrendingUp } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Card, EmptyState } from "../../components/ui/primitives";
import { useTheme } from "../../components/ui/theme";
import { CarService } from "../../store/carService";
import { setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";
import { TripService } from "../../store/tripService";
import {
  addTrip,
  deleteTrip,
  selectTotalSavingsFromTrips,
  setTrips,
  Trip,
  updateTrip,
} from "../../store/tripSlice";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});
const fmt = (v: number) => currency.format(Number(v || 0));

const MONTH_SHORT = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];
const MONTH_LONG = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthKeyFromDateStr(dateStr?: any): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Trips() {
  const { C, FONT } = useTheme();
  const dispatch = useDispatch();
  const cars = useSelector((s: RootState) => s.car.cars || []);
  const trips = useSelector((s: RootState) => s.trip.trips || []);
  const totalSavings = useSelector(selectTotalSavingsFromTrips);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const justCreatedTripIdRef = useRef<string | null>(null);

  // Savings chart state
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const t of trips as Trip[]) {
      const key = monthKeyFromDateStr(t.date);
      if (key) set.add(Number(key.split("-")[0]));
    }
    const arr = Array.from(set).sort((a, b) => b - a);
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr;
  }, [trips]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const [yearOpen, setYearOpen] = useState(false);
  const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null);

  useEffect(() => {
    if (!availableYears.includes(selectedYear))
      setSelectedYear(availableYears[0]);
  }, [availableYears]);
  useEffect(() => {
    setSelectedBarKey(null);
  }, [selectedYear]);

  const { bars, maxValue, yearTotal } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of trips as Trip[]) {
      const key = monthKeyFromDateStr(t.date);
      if (!key) continue;
      if (Number(key.split("-")[0]) !== selectedYear) continue;
      totals.set(key, (totals.get(key) ?? 0) + Number(t.savings ?? 0));
    }
    const arr = Array.from({ length: 12 }, (_, i) => {
      const k = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
      return { key: k, value: Number(totals.get(k) ?? 0) };
    });
    return {
      bars: arr,
      maxValue: Math.max(1, ...arr.map((b) => b.value)),
      yearTotal: arr.reduce((s, b) => s + b.value, 0),
    };
  }, [trips, selectedYear]);

  const selectedBar = useMemo(
    () => bars.find((b) => b.key === selectedBarKey) ?? null,
    [bars, selectedBarKey],
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, carsData] = await Promise.all([
        TripService.list(),
        CarService.list(),
      ]);
      dispatch(setCars(carsData));
      dispatch(setTrips(tripsData));
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedCar = selectedTrip?.car_id
    ? cars.find((c) => c.id === selectedTrip.car_id)
    : undefined;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const CHART_H = 140;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 64,
          paddingBottom: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View>
          <Text style={FONT.pageTitle}>Trips & Savings</Text>
          <Text style={[FONT.bodyMuted, { marginTop: 4 }]}>
            {trips.length} trip{trips.length !== 1 ? "s" : ""} · all-time savings below
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.primary,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: C.radius,
            gap: 6,
          }}
        >
          <Plus color={C.primaryText} size={16} />
          <Text style={{ color: C.primaryText, fontSize: 14, fontWeight: "700" }}>
            New Trip
          </Text>
        </TouchableOpacity>
      </View>

      {/* All-time savings hero */}
      <Card style={{ padding: 24, alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 52,
            height: 52,
            backgroundColor: C.greenTint,
            borderRadius: 26,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <DollarSign color={C.green} size={24} />
        </View>
        <Text
          style={{
            color: C.green,
            fontSize: 36,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          {fmt(totalSavings)}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
          All-time savings
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <TrendingUp color={C.green} size={14} />
          <Text style={{ color: C.green, fontSize: 13, marginLeft: 5 }}>
            Great progress!
          </Text>
        </View>
      </Card>

      {/* Savings history chart */}
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={FONT.sectionTitle}>Savings history</Text>
          <TouchableOpacity
            onPress={() => setYearOpen(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: C.surfaceAlt,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              gap: 6,
            }}
          >
            <Text
              style={{ color: C.textPrimary, fontSize: 13, fontWeight: "600" }}
            >
              {selectedYear}
            </Text>
            <Text style={{ color: C.textMuted, fontSize: 10 }}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 2 }}>
            {selectedBar
              ? `${MONTH_LONG[Number(selectedBar.key.split("-")[1]) - 1]} ${selectedYear}`
              : `${selectedYear} total`}
          </Text>
          <Text
            style={{ color: C.textPrimary, fontSize: 28, fontWeight: "700" }}
          >
            {selectedBar ? fmt(selectedBar.value) : fmt(yearTotal)}
          </Text>
        </View>

        <View style={{ height: CHART_H + 24 }}>
          <View
            style={{
              position: "absolute",
              bottom: 24,
              left: 0,
              right: 0,
              height: 0.5,
              backgroundColor: C.borderMid,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              height: CHART_H,
              paddingBottom: 0,
            }}
          >
            {bars.map(({ key, value }) => {
              const h =
                value === 0
                  ? 2
                  : Math.max(4, Math.round((value / maxValue) * CHART_H));
              const active = selectedBarKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() =>
                    setSelectedBarKey((p) => (p === key ? null : key))
                  }
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: CHART_H,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: h,
                      backgroundColor: active
                        ? C.primary
                        : value === 0
                          ? C.borderMid
                          : C.surfaceHi,
                      borderRadius: 4,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            {bars.map(({ key }, idx) => (
              <View key={key} style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    color: selectedBarKey === key ? C.primary : C.textMuted,
                    fontSize: 10,
                    fontWeight: selectedBarKey === key ? "700" : "400",
                  }}
                >
                  {MONTH_SHORT[idx]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 0.5,
            borderTopColor: C.border,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: C.textMuted, fontSize: 13 }}>
            {selectedYear} total
          </Text>
          <Text style={{ color: C.green, fontSize: 13, fontWeight: "700" }}>
            {fmt(yearTotal)}
          </Text>
        </View>
      </Card>

      {/* Past trips section */}
      <Text style={[FONT.sectionTitle, { marginBottom: 12 }]}>Past trips</Text>

      {trips.length === 0 ? (
        <EmptyState
          icon={<MapPin color={C.primary} size={28} />}
          title="No trips yet"
          subtitle="Start planning your first carpooling trip and start saving."
          action="Plan your first trip"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <View style={{ gap: 12 }}>
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              cars={cars}
              onClick={() => {
                setSelectedTrip(trip);
                setShowTripDetails(true);
              }}
              onDelete={async (id) => {
                await TripService.delete(id);
                dispatch(deleteTrip(id));
              }}
            />
          ))}
        </View>
      )}

      {/* Year picker modal */}
      <Modal
        visible={yearOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setYearOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
          onPress={() => setYearOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: C.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 0.5,
              borderColor: C.border,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[FONT.sectionTitle, { marginBottom: 16 }]}>
              Select year
            </Text>
            {availableYears.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  setSelectedYear(y);
                  setYearOpen(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  marginBottom: 6,
                  backgroundColor:
                    y === selectedYear ? C.primary : C.surfaceAlt,
                }}
              >
                <Text
                  style={{
                    color: y === selectedYear ? C.primaryText : C.textPrimary,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setYearOpen(false)}
              style={{ paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: C.textMuted, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {showForm && (
        <SimplifiedTripForm
          cars={cars}
          onCalculate={async (incoming: Trip) => {
            try {
              setIsCalculating(true);
              const car = cars.find((c) => c.id === incoming.car_id);
              const tripData: Trip = {
                ...incoming,
                car_name: car ? `${car.make} ${car.model}` : incoming.car_name,
              };
              const saved = await TripService.create(tripData);
              dispatch(addTrip(saved));
              justCreatedTripIdRef.current = saved.id;
              setPendingTrip(saved);
              setShowForm(false);
              setShowConfirmation(true);
            } catch (e) {
              console.error("Error creating trip:", e);
            } finally {
              setIsCalculating(false);
            }
          }}
          onCancel={() => setShowForm(false)}
          isCalculating={isCalculating}
        />
      )}

      {showConfirmation && pendingTrip && (
        <TripConfirmation
          trip={pendingTrip}
          onConfirm={async (updated) => {
            try {
              setIsCalculating(true);
              const s = Number.isFinite(updated.savings as number)
                ? (updated.savings as number)
                : 0;
              await TripService.update(updated.id, { savings: s });
              dispatch(
                updateTrip({ id: updated.id, tripData: { savings: s } }),
              );
            } catch (e) {
              console.error("Error confirming trip:", e);
            } finally {
              setIsCalculating(false);
              setShowConfirmation(false);
              setPendingTrip(null);
              justCreatedTripIdRef.current = null;
            }
          }}
          onCancel={async () => {
            try {
              setIsCalculating(true);
              const id = justCreatedTripIdRef.current || pendingTrip.id;
              await TripService.delete(id);
              dispatch(deleteTrip(id));
            } catch (e) {
              console.error("Error rolling back trip:", e);
            } finally {
              setIsCalculating(false);
              setShowConfirmation(false);
              setPendingTrip(null);
              justCreatedTripIdRef.current = null;
            }
          }}
        />
      )}

      {showTripDetails && selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          cars={cars}
          onEditLocations={() => {
            setShowTripDetails(false);
            setShowLocationEditor(true);
          }}
          onClose={() => {
            setShowTripDetails(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {showLocationEditor && selectedTrip && selectedCar && (
        <LocationEditor
          trip={selectedTrip}
          car={selectedCar}
          carList={cars}
          passengers={selectedTrip.passengers ?? "1"}
          onCancel={() => {
            setShowLocationEditor(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {showLocationEditor && selectedTrip && !selectedCar && (
        <View
          style={{
            padding: 16,
            backgroundColor: C.surface,
            borderRadius: C.radiusLg,
            marginTop: 16,
          }}
        >
          <Text style={{ color: C.textPrimary }}>
            This trip has no car selected. Please assign a car before editing.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
