// src/components/trips/SimplifiedTripForm.tsx
import { Picker } from "@react-native-picker/picker";
import {
  Car as CarIcon,
  MapPin,
  Users
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Car } from "../../store/carSlice";
import { Trip } from "../../store/tripSlice";

import { computeTripOneWay } from "@/assets/utils/computeTrips";
import AutocompleteInput from "@/components/AutoComplete";

interface Props {
  cars: Car[];
  onCalculate: (data: Trip) => void;
  onCancel: () => void;
  isCalculating: boolean;
}

// ─── Small reusable section label ────────────────────────────────────────────
function FieldLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
      }}
    >
      {icon}
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

// ─── Divider between From / To ────────────────────────────────────────────────
function RouteDivider() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
        paddingLeft: 3,
      }}
    >
      <View
        style={{
          width: 1,
          height: 18,
          backgroundColor: "#374151",
          marginLeft: 9,
        }}
      />
    </View>
  );
}

export default function SimplifiedTripForm({
  cars,
  onCalculate,
  onCancel,
  isCalculating,
}: Props) {
  const [form, setForm] = useState<Trip>({
    id: "",
    destination: "",
    date: "",
    from_location: "",
    to_location: "",
    passengers: "",
    car_id: "",
  });

  const [originCoords, setOriginCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [originResolved, setOriginResolved] = useState<string>("");

  const [destCoords, setDestCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destResolved, setDestResolved] = useState<string>("");

  const [localBusy, setLocalBusy] = useState(false);
  const [passengersFocused, setPassengersFocused] = useState(false);

  const selectedCar = cars.find((c) => c.id === form.car_id);

  const canSubmit =
    !!form.from_location &&
    !!form.to_location &&
    !!form.car_id &&
    !isCalculating &&
    !localBusy;

  async function handleNext() {
    try {
      if (!form.from_location || !form.to_location || !form.car_id) return;

      if (form.passengers && !/^\d+$/.test(form.passengers)) {
        return Alert.alert(
          "Invalid passengers",
          "Enter a whole number (e.g., 1, 2, 3).",
        );
      }

      setLocalBusy(true);

      if (!selectedCar) {
        setLocalBusy(false);
        return Alert.alert("Select a car", "Please choose a car to continue.");
      }

      const m = await computeTripOneWay({
        fromText: originResolved || form.from_location,
        toText: destResolved || form.to_location,
        car: selectedCar,
        passengers: form.passengers,
        fromCoords: originCoords,
        toCoords: destCoords,
      });

      const payload: Trip = {
        id: "",
        destination: (m.toResolved || form.to_location || "").trim(),
        date: new Date().toISOString(),
        from_location: originResolved || form.from_location,
        to_location: destResolved || form.to_location,
        passengers: m.passengers,
        car_id: form.car_id,
        distance: m.distanceKm,
        cost: m.totalCost,
      };

      onCalculate(payload);
    } catch (e: any) {
      Alert.alert("Trip error", e?.message ?? "Failed to calculate route");
    } finally {
      setLocalBusy(false);
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#000" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                backgroundColor: "#111827",
                borderRadius: 20,
                padding: 24,
                width: "100%",
                maxWidth: 440,
                borderWidth: 1,
                borderColor: "#1F2937",
              }}
            >
              {/* ── Header ── */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 24,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      color: "#F9FAFB",
                      fontSize: 22,
                      fontWeight: "700",
                      lineHeight: 28,
                    }}
                  >
                    Where are you going?
                  </Text>
                  <Text
                    style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}
                  >
                    Fill in your trip details below
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onCancel}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{
                    backgroundColor: "#1F2937",
                    borderRadius: 20,
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 18 }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Route card (From + To grouped) ── */}
              <View
                style={{
                  backgroundColor: "#0F172A",
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#1E293B",
                  marginBottom: 16,
                }}
              >
                {/* From */}
                <View style={{ zIndex: 60 }}>
                  <FieldLabel
                    icon={<MapPin color="#4ade80" size={14} />}
                    text="From"
                  />
                  <AutocompleteInput
                    placeholder="Search starting point"
                    initialText={form.from_location}
                    onTextChange={(text) => {
                      setForm((f) => ({ ...f, from_location: text }));
                      setOriginCoords(null);
                      setOriginResolved("");
                    }}
                    onSelected={(v) => {
                      setForm((f) => ({ ...f, from_location: v.description }));
                      setOriginCoords({ lat: v.lat, lng: v.lng });
                      setOriginResolved(v.description);
                    }}
                  />
                </View>

                <RouteDivider />

                {/* To */}
                <View style={{ zIndex: 50, marginTop: 4 }}>
                  <FieldLabel
                    icon={<MapPin color="#4ade80" size={14} />}
                    text="To"
                  />
                  <AutocompleteInput
                    placeholder="Search destination"
                    initialText={form.to_location}
                    onTextChange={(text) => {
                      setForm((f) => ({ ...f, to_location: text }));
                      setDestCoords(null);
                      setDestResolved("");
                    }}
                    onSelected={(v) => {
                      setForm((f) => ({ ...f, to_location: v.description }));
                      setDestCoords({ lat: v.lat, lng: v.lng });
                      setDestResolved(v.description);
                    }}
                  />
                </View>
              </View>

              {/* ── Passengers + Car row ── */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                {/* Passengers */}
                <View style={{ flex: 1 }}>
                  <FieldLabel
                    icon={<Users color="#4ade80" size={14} />}
                    text="Passengers"
                  />
                  <View
                    style={{
                      backgroundColor: "#1F2937",
                      borderWidth: 1,
                      borderColor: passengersFocused ? "#4ade80" : "#374151",
                      borderRadius: 10,
                      height: 52,
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <TextInput
                      keyboardType="number-pad"
                      value={form.passengers}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, passengers: text }))
                      }
                      onFocus={() => setPassengersFocused(true)}
                      onBlur={() => setPassengersFocused(false)}
                      placeholder="e.g. 2"
                      placeholderTextColor="#6B7280"
                      style={{
                        color: "#F9FAFB",
                        fontSize: 15,
                        paddingVertical: 0,
                      }}
                    />
                  </View>
                </View>

                {/* Car */}
                <View style={{ flex: 2 }}>
                  <FieldLabel
                    icon={<CarIcon color="#4ade80" size={14} />}
                    text="Car"
                  />
                  <View
                    style={{
                      backgroundColor: "#1F2937",
                      borderWidth: 1,
                      borderColor: form.car_id ? "#4ade80" : "#374151",
                      borderRadius: 10,
                      height: 52,
                      overflow: "hidden",
                      justifyContent: "center",
                    }}
                  >
                    <Picker
                      selectedValue={form.car_id}
                      onValueChange={(val) =>
                        setForm((f) => ({ ...f, car_id: val as string }))
                      }
                      dropdownIconColor="#6B7280"
                      style={{
                        color: form.car_id ? "#F9FAFB" : "#6B7280",
                        // on iOS the Picker renders taller than its container;
                        // a negative margin pulls it back into the 52px box
                        marginTop: Platform.OS === "ios" ? -8 : 0,
                        marginBottom: Platform.OS === "ios" ? -8 : 0,
                      }}
                      itemStyle={{ color: "#F9FAFB", fontSize: 15 }}
                    >
                      <Picker.Item
                        label="Select car"
                        value=""
                        color="#6B7280"
                      />
                      {cars.map((c) => (
                        <Picker.Item
                          key={c.id}
                          label={`${c.make} ${c.model}`}
                          value={c.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {/* ── Submit ── */}
              <TouchableOpacity
                onPress={handleNext}
                disabled={!canSubmit}
                activeOpacity={0.85}
                style={{
                  backgroundColor: canSubmit ? "#4ade80" : "#1F2937",
                  borderRadius: 12,
                  height: 52,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: canSubmit ? 0 : 1,
                  borderColor: "#374151",
                }}
              >
                {isCalculating || localBusy ? (
                  <ActivityIndicator color={canSubmit ? "#000" : "#6B7280"} />
                ) : (
                  <Text
                    style={{
                      color: canSubmit ? "#052e16" : "#6B7280",
                      fontSize: 16,
                      fontWeight: "700",
                      letterSpacing: 0.3,
                    }}
                  >
                    Calculate route →
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
