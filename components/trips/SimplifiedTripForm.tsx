// src/components/trips/SimplifiedTripForm.tsx
import { Picker } from '@react-native-picker/picker';
import { Car as CarIcon, MapPin, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Car } from '../../store/carSlice';
import { Trip } from '../../store/tripSlice';

// Your autocomplete input
import AutocompleteInput from '@/components/AutoComplete';

// 🔁 Shared one-way calc
import { computeTripOneWay } from '@/assets/utils/computeTrips';

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
    id: '',
    destination: '',
    date: '',
    from_location: '',
    to_location: '',
    passengers: '',
    car_id: '',
  });

  // Origin (From) via autocomplete
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originResolved, setOriginResolved] = useState<string>('');

  // Destination (To) via autocomplete
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destResolved, setDestResolved] = useState<string>('');

  const [localBusy, setLocalBusy] = useState(false);

  const canSubmit =
    !!form.from_location && !!form.to_location && !!form.car_id && !isCalculating && !localBusy;

  if (!cars || cars.length === 0) {
    return (
      <Modal transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(24, 32, 47, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View className="bg-gray-900 rounded-xl p-6 w-full max-w-md items-center">
            <Text className="text-xl font-semibold text-white mb-4">No cars available</Text>
            <Text className="text-gray-400 text-lg text-center mb-6">
              Please add a car before planning a trip.
            </Text>
            <TouchableOpacity onPress={onCancel} className="bg-main rounded-lg px-4 py-2">
              <Text className="text-white text-lg font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  async function handleNext() {
    try {
      if (!form.from_location || !form.to_location || !form.car_id) return;
      if (form.passengers && !/^\d+$/.test(form.passengers)) {
        return Alert.alert('Invalid passengers', 'Enter a whole number (e.g., 1, 2, 3).');
      }

      setLocalBusy(true);

      // Pick the selected car
      const selectedCar = cars.find(c => c.id === form.car_id);
      if (!selectedCar) {
        setLocalBusy(false);
        return Alert.alert('Select a car', 'Please choose a car to continue.');
      }

      // 🔁 Use shared helper (one-way only)
      const m = await computeTripOneWay({
        fromText: originResolved || form.from_location,
        toText:   destResolved   || form.to_location,
        car: selectedCar,
        passengers: form.passengers,
        fromCoords: originCoords,
        toCoords:   destCoords,
      });

      // Build payload -> parent saves / opens confirmation
      const payload: Trip = {
        id: '', // let backend set id
        destination: (form.destination?.trim() || m.toResolved || form.to_location || '').trim(),
        date: form.date || new Date().toISOString(),

        from_location_name: m.fromResolved || undefined,
        to_location_name:   m.toResolved   || undefined,

        from_location: originResolved || form.from_location || undefined, // raw/pretty for UI
        to_location:   destResolved   || form.to_location   || undefined,

        passengers: m.passengers,
        car_id: form.car_id || undefined,

        distance: m.distanceKm,                // km (one-way)
        cost: m.totalCost,                     // CAD

        // Optional extras you may want to store/show:
        // fuel_liters: m.litres,
        // fuel_price_per_l: m.pricePerL,
        // cost_per_person: m.costPerPerson,
      };

      onCalculate(payload);
    } catch (e: any) {
      Alert.alert('Trip error', e?.message ?? 'Failed to calculate route');
    } finally {
      setLocalBusy(false);
    }
  }

  return (
    <Modal transparent={false} visible={true} animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white">Where are you going?</Text>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          <View className="space-y-6">
            {/* From */}
            <View style={{ zIndex: 60 }}>
              <View className="flex-row items-center mb-2">
                <MapPin color="#4ade80" size={18} />
                <Text className="ml-2 text-white text-xl">From</Text>
              </View>

              <AutocompleteInput
                label=""
                placeholder="Search starting point"
                initialText={form.from_location}
                onTextChange={(text) => {
                  setForm((f) => ({ ...f, from_location: text }));
                  setOriginCoords(null);
                  setOriginResolved('');
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
                <MapPin color="#4ade80" size={18} />
                <Text className="ml-2 text-white text-xl">To</Text>
              </View>

              <AutocompleteInput
                label=""
                placeholder="Search destination"
                initialText={form.to_location}
                onTextChange={(text) => {
                  setForm((f) => ({ ...f, to_location: text }));
                  setDestCoords(null);
                  setDestResolved('');
                }}
                onSelected={(v) => {
                  setForm((f) => ({ ...f, to_location: v.description }));
                  setDestCoords({ lat: v.lat, lng: v.lng });
                  setDestResolved(v.description);
                }}
              />
            </View>

            <View className="flex-row space-x-4 gap-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Users color="#4ade80" size={18} />
                  <Text className="ml-2 text-white text-xl">Passengers</Text>
                </View>

                <View className="h-14 bg-gray-800 border border-gray-600 rounded-lg">
                  <TextInput
                    keyboardType="number-pad"
                    value={form.passengers}
                    onChangeText={(text) => setForm((f) => ({ ...f, passengers: text }))}
                    placeholder="Number of cotripers"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      height: '100%',
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                      color: '#fff',
                      fontSize: 16,
                      lineHeight: 20,
                      textAlignVertical: 'center',
                      textAlign: 'left',
                    }}
                  />
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <CarIcon color="#4ade80" size={22} />
                  <Text className="ml-2 text-white text-xl">Car</Text>
                </View>
                <View className="bg-gray-800 border border-gray-600 rounded-lg mb-6">
                  <Picker
                    selectedValue={form.car_id}
                    onValueChange={(val) => setForm((f) => ({ ...f, car_id: val as string }))}
                    style={{ color: '#fff', padding: 10, fontSize: 16 }}
                  >
                    <Picker.Item label="Select car" value="" />
                    {cars.map((c) => (
                      <Picker.Item key={c.id} label={`${c.make} ${c.model}`} value={c.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canSubmit}
              className={`rounded-lg py-3 ${canSubmit ? 'bg-main' : 'bg-gray-300'} items-center`}
            >
              {(isCalculating || localBusy) ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-xl font-medium">Next</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
