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

// API helpers
import { geocodeAddress, getRoute, routeByAddresses } from '@/assets/api/mapsApi';

// Autocomplete component (you already have this)
import AutocompleteInput from '@/components/AutoComplete';

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

  // Origin (From) selection via autocomplete
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originResolved, setOriginResolved] = useState<string>('');

  // Destination (To) selection via autocomplete
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destResolved, setDestResolved] = useState<string>('');

  const [localBusy, setLocalBusy] = useState(false);

  const canSubmit =
    !!form.from_location && !!form.to_location && !!form.car_id && !isCalculating && !localBusy;

  if (!cars || cars.length === 0) {
    return (
      <Modal transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
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

      let enriched: any;

      if (originCoords && destCoords) {
        // Both were selected from autocomplete (coords already known)
        const route = await getRoute(originCoords, destCoords);
        enriched = {
          ...form,
          from_resolved: originResolved || form.from_location,
          to_resolved: destResolved || form.to_location,
          from_coords: originCoords,
          to_coords: destCoords,
          distance_meters: route.meters,
          duration_seconds: route.seconds,
        };
      } else if (originCoords && !destCoords) {
        // Only origin picked → geocode destination
        const to = await geocodeAddress(form.to_location);
        const route = await getRoute(originCoords, to.location);
        enriched = {
          ...form,
          from_resolved: originResolved || form.from_location,
          to_resolved: to.formatted_address,
          from_coords: originCoords,
          to_coords: to.location,
          distance_meters: route.meters,
          duration_seconds: route.seconds,
        };
      } else if (!originCoords && destCoords) {
        // Only destination picked → geocode origin
        const from = await geocodeAddress(form.from_location);
        const route = await getRoute(from.location, destCoords);
        enriched = {
          ...form,
          from_resolved: from.formatted_address,
          to_resolved: destResolved || form.to_location,
          from_coords: from.location,
          to_coords: destCoords,
          distance_meters: route.meters,
          duration_seconds: route.seconds,
        };
      } else {
        // Neither picked → free-text for both
        const { from, to, route } = await routeByAddresses(form.from_location, form.to_location);
        enriched = {
          ...form,
          from_resolved: from.formatted_address,
          to_resolved: to.formatted_address,
          from_coords: from.location,
          to_coords: to.location,
          distance_meters: route.meters,
          duration_seconds: route.seconds,
        };
      }

      onCalculate(enriched as Trip); // cast until you extend Trip with optional fields
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
            {/* From (Origin with autocomplete) */}
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

            {/* To (Destination with autocomplete) */}
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
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, passengers: text }))
                    }
                    placeholder="Number of cotripers"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      height: '100%',
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                      color: '#fff', // ensure typed number is white
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
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, car_id: val as string }))
                    }
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
