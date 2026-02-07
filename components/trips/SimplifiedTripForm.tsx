// src/components/trips/SimplifiedTripForm.tsx
import { Picker } from "@react-native-picker/picker";
import { Car as CarIcon, MapPin, Users, X } from "lucide-react-native";
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
          "Enter a whole number (e.g., 1, 2, 3)."
        );
      }

      setLocalBusy(true);

      const selectedCar = cars.find((c) => c.id === form.car_id);
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
        className="flex-1 bg-black"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center">
            <View className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className="text-2xl font-bold text-white flex-1 pr-3"
                  numberOfLines={2}
                >
                  Where are you going?
                </Text>
                <TouchableOpacity onPress={onCancel} style={{ flexShrink: 0 }}>
                  <X color="#9CA3AF" size={24} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View className="space-y-6">
                {/* From */}
                <View style={{ zIndex: 60 }}>
                  <View className="flex-row items-center mb-2">
                    <MapPin color="#4ade80" size={20} />
                    <Text className="ml-2 text-white text-xl">From</Text>
                  </View>

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

                {/* To */}
                <View style={{ zIndex: 50 }}>
                  <View className="flex-row items-center mb-2">
                    <MapPin color="#4ade80" size={20} />
                    <Text className="ml-2 text-white text-xl">To</Text>
                  </View>

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

                {/* Passengers */}
                <View>
                  <View className="flex-row items-center mb-2">
                    <Users color="#4ade80" size={20} />
                    <Text className="ml-2 text-white text-xl">Passengers</Text>
                  </View>

                  <View className="h-14 bg-gray-800 border border-gray-600 rounded-lg">
                    <TextInput
                      keyboardType="number-pad"
                      value={form.passengers}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, passengers: text }))
                      }
                      placeholder="Number of cotrippers"
                      placeholderTextColor="#9CA3AF"
                      style={{
                        height: "100%",
                        paddingHorizontal: 12,
                        color: "#fff",
                        fontSize: 16,
                        textAlignVertical: "center",
                      }}
                    />
                  </View>
                </View>

                {/* Car */}
                <View style={{ marginBottom: 16 }}>
                  <View className="flex-row items-center mb-2">
                    <CarIcon color="#4ade80" size={22} />
                    <Text className="ml-2 text-white text-xl">Car</Text>
                  </View>

                  <View
                    className={`border rounded-lg overflow-hidden ${
                      form.car_id
                        ? "bg-gray-800 border-green-500"
                        : "bg-gray-900 border-gray-700"
                    }`}
                    style={{ opacity: form.car_id ? 1 : 0.75 }}
                  >
                    <Picker
                      selectedValue={form.car_id}
                      onValueChange={(val) =>
                        setForm((f) => ({ ...f, car_id: val as string }))
                      }
                      dropdownIconColor="#ffffff"
                      style={{ color: "#ffffff" }}
                      itemStyle={{ color: "#ffffff", fontSize: 16 }}
                    >
                      <Picker.Item
                        label="Select car"
                        value=""
                        color="#9CA3AF"
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

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleNext}
                  disabled={!canSubmit}
                  className={`rounded-lg py-3 ${
                    canSubmit ? "bg-main" : "bg-gray-300"
                  } items-center`}
                  style={{ marginBottom: 8 }} // small extra breathing room
                >
                  {isCalculating || localBusy ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-xl font-medium">Next</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
