import { computeTripOneWay } from "@/assets/utils/computeTrips";
import AutocompleteInput from "@/components/AutoComplete";
import type { Car } from "@/store/carSlice";
import { TripService } from "@/store/tripService";
import type { Trip } from "@/store/tripSlice";
import { updateTrip } from "@/store/tripSlice";
import { Car as CarIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { Btn, FieldLabel, ModalShell } from "../ui/primitives";
import { useTheme } from "../ui/theme";

// Reuse the same bottom sheet from SimplifiedTripForm
function CarPickerSheet({
  cars,
  selectedId,
  onSelect,
  onClose,
}: {
  cars: Car[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { C } = useTheme();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: C.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 0.5,
            borderColor: C.border,
            paddingBottom: Platform.OS === "ios" ? 34 : 20,
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: C.borderMid,
              borderRadius: 2,
              alignSelf: "center",
              marginTop: 12,
              marginBottom: 6,
            }}
          />
          <Text
            style={{
              color: C.textMuted,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.7,
              textTransform: "uppercase",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: C.border,
            }}
          >
            Select a car
          </Text>
          {cars.map((c, i) => {
            const active = c.id === selectedId;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  onSelect(c.id);
                  onClose();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: i < cars.length - 1 ? 0.5 : 0,
                  borderBottomColor: C.border,
                  backgroundColor: active ? "#0d2117" : "transparent",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: active ? C.greenTint : C.surfaceAlt,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <CarIcon color={active ? C.green : C.textMuted} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: C.textPrimary,
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    {c.make} {c.model}
                  </Text>
                  <Text
                    style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}
                  >
                    {c.year}
                    {c.consumption_l_100km
                      ? ` · ${c.consumption_l_100km} L/100km`
                      : ""}
                  </Text>
                </View>
                {active && (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: C.green,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: C.greenDim,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

interface Props {
  trip: Trip;
  car: Car;
  carList: Car[];
  passengers?: string | number;
  onCancel: () => void;
}

export default function LocationEditor({
  trip,
  car,
  carList,
  onCancel,
}: Props) {
  const { C } = useTheme();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    from_location_name: trip.from_location_name || trip.from_location || "",
    to_location_name: trip.to_location_name || trip.to_location || "",
  });
  const [fromCoords, setFromCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [passengersValue, setPassengersValue] = useState(
    trip.passengers ?? "0",
  );
  const [selectedCarId, setSelectedCarId] = useState(trip.car_id ?? car.id);
  const [showCarPicker, setShowCarPicker] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const selectedCar = carList.find((c) => c.id === selectedCarId) ?? car;
  const canSave = useMemo(
    () =>
      form.from_location_name.trim().length > 0 &&
      form.to_location_name.trim().length > 0 &&
      !busy,
    [form, busy],
  );

  const handleSave = async () => {
    try {
      setBusy(true);
      const nPassengers = parseInt(passengersValue || "0", 10);
      const m = await computeTripOneWay({
        fromText: form.from_location_name,
        toText: form.to_location_name,
        car: selectedCar,
        passengers: nPassengers,
        fromCoords,
        toCoords,
      });
      const people = nPassengers + 1;
      const perPerson = people > 0 ? m.totalCost / people : 0;
      const computedSavings = Number((perPerson * nPassengers).toFixed(2));
      const patch: Partial<Trip> = {
        from_location_name: m.fromResolved,
        to_location_name: m.toResolved,
        from_location: m.fromResolved,
        to_location: m.toResolved,
        distance: m.distanceKm,
        cost: m.totalCost,
        savings: computedSavings,
        passengers: String(nPassengers),
        car_id: selectedCar.id,
        destination: trip.destination ?? m.toResolved ?? form.to_location_name,
        date: trip.date ?? new Date().toISOString(),
      };
      dispatch(updateTrip({ id: trip.id, tripData: patch }));
      await TripService.update(trip.id, patch);
      onCancel();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Could not update the trip.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ModalShell
          title="Edit trip"
          subtitle="Update route and details"
          onClose={onCancel}
        >
          <View
            style={{
              backgroundColor: "#0d1117",
              borderRadius: 14,
              padding: 16,
              borderWidth: 0.5,
              borderColor: C.border,
              marginBottom: 16,
            }}
          >
            <View style={{ zIndex: 60 }}>
              <FieldLabel text="From" />
              <AutocompleteInput
                placeholder="Enter Point A"
                initialText={form.from_location_name}
                onTextChange={(t) => {
                  setForm((f) => ({ ...f, from_location_name: t }));
                  setFromCoords(null);
                }}
                onSelected={(v) => {
                  setForm((f) => ({ ...f, from_location_name: v.description }));
                  setFromCoords({ lat: v.lat, lng: v.lng });
                }}
              />
            </View>
            <View
              style={{
                width: 1,
                height: 14,
                backgroundColor: C.borderMid,
                marginLeft: 5,
                marginVertical: 8,
              }}
            />
            <View style={{ zIndex: 50 }}>
              <FieldLabel text="To" />
              <AutocompleteInput
                placeholder="Enter Point B"
                initialText={form.to_location_name}
                onTextChange={(t) => {
                  setForm((f) => ({ ...f, to_location_name: t }));
                  setToCoords(null);
                }}
                onSelected={(v) => {
                  setForm((f) => ({ ...f, to_location_name: v.description }));
                  setToCoords({ lat: v.lat, lng: v.lng });
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="Passengers" />
              <View
                style={{
                  backgroundColor: C.surfaceAlt,
                  borderWidth: 1,
                  borderColor: passFocused ? C.borderFocus : C.borderMid,
                  borderRadius: C.radius,
                  height: 52,
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <TextInput
                  keyboardType="number-pad"
                  value={passengersValue}
                  onChangeText={(t) =>
                    setPassengersValue(t.replace(/[^0-9]/g, ""))
                  }
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                  style={{
                    color: C.textPrimary,
                    fontSize: 15,
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>
            <View style={{ flex: 2 }}>
              <FieldLabel text="Car" />
              <TouchableOpacity
                onPress={() => setShowCarPicker(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: C.surfaceAlt,
                  borderWidth: 1,
                  borderColor: C.borderFocus,
                  borderRadius: C.radius,
                  height: 52,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <CarIcon color={C.green} size={16} />
                <Text
                  style={{ color: C.textPrimary, fontSize: 14, flex: 1 }}
                  numberOfLines={1}
                >
                  {selectedCar.make} {selectedCar.model}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 10 }}>▾</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Btn
              label="Cancel"
              variant="outline"
              onPress={onCancel}
              disabled={busy}
              style={{ flex: 1 }}
            />
            <View style={{ flex: 1 }}>
              {busy ? (
                <View
                  style={{
                    height: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: C.surface,
                    borderRadius: C.radius,
                    borderWidth: 1,
                    borderColor: C.borderMid,
                  }}
                >
                  <ActivityIndicator color={C.green} />
                </View>
              ) : (
                <Btn
                  label="Save"
                  onPress={handleSave}
                  disabled={!canSave}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        </ModalShell>
      </View>

      {showCarPicker && (
        <CarPickerSheet
          cars={carList}
          selectedId={selectedCarId}
          onSelect={setSelectedCarId}
          onClose={() => setShowCarPicker(false)}
        />
      )}
    </Modal>
  );
}
