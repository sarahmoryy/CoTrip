import LocationEditor from "@/components/trips/LocationEditor";
import SimplifiedTripForm from "@/components/trips/SimplifiedTripForm";
import TripCard from "@/components/trips/TripCard";
import TripConfirmation from "@/components/trips/TripConfirmation";
import TripDetails from "@/components/trips/TripDetails";
import { MapPin, Plus } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../components/ui/primitives";
import { C, FONT } from "../../components/ui/theme";
import { CarService } from "../../store/carService";
import { setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";
import { TripService } from "../../store/tripService";
import {
  addTrip,
  deleteTrip,
  setTrips,
  Trip,
  updateTrip,
} from "../../store/tripSlice";

export default function Trips() {
  const dispatch = useDispatch();
  const cars = useSelector((s: RootState) => s.car.cars || []);
  const trips = useSelector((s: RootState) => s.trip.trips || []);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const justCreatedTripIdRef = useRef<string | null>(null);

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
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

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
          <Text style={FONT.pageTitle}>Your Trips</Text>
          <Text style={[FONT.bodyMuted, { marginTop: 4 }]}>
            {trips.length} trip{trips.length !== 1 ? "s" : ""} total
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.greenDark,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: C.radius,
            gap: 6,
          }}
        >
          <Plus color="#fff" size={16} />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            New Trip
          </Text>
        </TouchableOpacity>
      </View>

      {trips.length === 0 ? (
        <EmptyState
          icon={<MapPin color={C.green} size={28} />}
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

      {showForm && (
        <SimplifiedTripForm
          cars={cars}
          onCalculate={async (incoming: Trip) => {
            try {
              setIsCalculating(true);
              const saved = await TripService.create(incoming);
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
