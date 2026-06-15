import { computeTripOneWay } from "@/assets/utils/computeTrips";
import AutocompleteInput from "@/components/AutoComplete";
import { Car as CarIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Car } from "../../store/carSlice";
import { Trip } from "../../store/tripSlice";
import { Btn, FieldLabel, ModalShell } from "../ui/primitives";
import { useTheme } from "../ui/theme";

interface Props {
  cars: Car[];
  onCalculate: (data: Trip) => void;
  onCancel: () => void;
  isCalculating: boolean;
}

// ── Car Picker bottom sheet ────────────────────────────────────────────────────
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
          {/* Handle */}
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
          {cars.length === 0 ? (
            <Text
              style={{
                color: C.textMuted,
                textAlign: "center",
                padding: 32,
                fontSize: 14,
              }}
            >
              No cars registered yet. Add a car first.
            </Text>
          ) : (
            cars.map((c, i) => {
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
            })
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function SimplifiedTripForm({
  cars,
  onCalculate,
  onCancel,
  isCalculating,
}: Props) {
  const { C } = useTheme();
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
  const [originResolved, setOriginResolved] = useState("");
  const [destCoords, setDestCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destResolved, setDestResolved] = useState("");
  const [localBusy, setLocalBusy] = useState(false);
  const [showCarPicker, setShowCarPicker] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const selectedCar = cars.find((c) => c.id === form.car_id);
  const canSubmit =
    !!form.from_location &&
    !!form.to_location &&
    !!form.car_id &&
    !isCalculating &&
    !localBusy;

  async function handleNext() {
    if (!form.from_location || !form.to_location || !form.car_id) return;
    if (form.passengers && !/^\d+$/.test(form.passengers))
      return Alert.alert(
        "Invalid passengers",
        "Enter a whole number (e.g., 1, 2, 3).",
      );
    setLocalBusy(true);
    try {
      const m = await computeTripOneWay({
        fromText: originResolved || form.from_location,
        toText: destResolved || form.to_location,
        car: selectedCar!,
        passengers: form.passengers,
        fromCoords: originCoords,
        toCoords: destCoords,
      });
      onCalculate({
        id: "",
        destination: (m.toResolved || form.to_location || "").trim(),
        date: new Date().toISOString(),
        from_location: originResolved || form.from_location,
        to_location: destResolved || form.to_location,
        passengers: m.passengers,
        car_id: form.car_id,
        car_name: selectedCar ? `${selectedCar.make} ${selectedCar.model}` : undefined,
        distance: m.distanceKm,
        cost: m.totalCost,
      });
    } catch (e: any) {
      Alert.alert("Trip error", e?.message ?? "Failed to calculate route");
    } finally {
      setLocalBusy(false);
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: C.bg }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          <ModalShell
            title="Where are you going?"
            subtitle="Fill in your trip details"
            onClose={onCancel}
          >
            {/* Route card */}
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
                  placeholder="Search starting point"
                  initialText={form.from_location}
                  onTextChange={(t) => {
                    setForm((f) => ({ ...f, from_location: t }));
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 8,
                  paddingLeft: 2,
                }}
              >
                <View
                  style={{
                    width: 1,
                    height: 16,
                    backgroundColor: C.borderMid,
                    marginLeft: 5,
                  }}
                />
              </View>
              <View style={{ zIndex: 50 }}>
                <FieldLabel text="To" />
                <AutocompleteInput
                  placeholder="Search destination"
                  initialText={form.to_location}
                  onTextChange={(t) => {
                    setForm((f) => ({ ...f, to_location: t }));
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

            {/* Passengers + Car row */}
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
                    value={form.passengers}
                    onChangeText={(t) =>
                      setForm((f) => ({ ...f, passengers: t }))
                    }
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="e.g. 2"
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
                    borderColor: selectedCar ? C.borderFocus : C.borderMid,
                    borderRadius: C.radius,
                    height: 52,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    gap: 8,
                  }}
                >
                  <CarIcon
                    color={selectedCar ? C.green : C.textMuted}
                    size={16}
                  />
                  <Text
                    style={{
                      color: selectedCar ? C.textPrimary : C.textMuted,
                      fontSize: 14,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {selectedCar
                      ? `${selectedCar.make} ${selectedCar.model}`
                      : "Select car"}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 10 }}>▾</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Btn
              label="Calculate route →"
              onPress={handleNext}
              disabled={!canSubmit}
              loading={isCalculating || localBusy}
            />
          </ModalShell>
        </ScrollView>
      </KeyboardAvoidingView>

      {showCarPicker && (
        <CarPickerSheet
          cars={cars}
          selectedId={form.car_id || ""}
          onSelect={(id) => setForm((f) => ({ ...f, car_id: id }))}
          onClose={() => setShowCarPicker(false)}
        />
      )}
    </Modal>
  );
}
1