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

// API helpers (your existing ones)
import { geocodeAddress, getRoute, routeByAddresses } from '@/assets/api/mapsApi';

// Fuel price (CollectAPI via RapidAPI) helper
import { fetchCanadaGasPricePerLitre } from '@/assets/api/fuelPriceApi';

// Autocomplete component (your existing one)
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

  // ---- helpers ----
  const getCarLPerKm = (car?: Car): number => {
    // Prefer canonical l_per_km if you have it; otherwise derive from L/100km
    const anyCar = car as any;
    if (typeof anyCar?.l_per_km === 'number') return anyCar.l_per_km;
    if (typeof car?.consumption_l_100km === 'number') return car.consumption_l_100km / 100;
    return 0.085; // fallback (~8.5 L/100km)
  };

  async function handleNext() {
    try {
      if (!form.from_location || !form.to_location || !form.car_id) return;
      if (form.passengers && !/^\d+$/.test(form.passengers)) {
        return Alert.alert('Invalid passengers', 'Enter a whole number (e.g., 1, 2, 3).');
      }

      setLocalBusy(true);

      // 1) Resolve route (you already had this logic)
      let fromResolved = '', toResolved = '';
      let meters = 0;

      if (originCoords && destCoords) {
        const route = await getRoute(originCoords, destCoords);
        fromResolved = originResolved || form.from_location;
        toResolved = destResolved || form.to_location;
        meters = route.meters;
      } else if (originCoords && !destCoords) {
        const to = await geocodeAddress(form.to_location);
        const route = await getRoute(originCoords, to.location);
        fromResolved = originResolved || form.from_location;
        toResolved = to.formatted_address;
        meters = route.meters;
      } else if (!originCoords && destCoords) {
        const from = await geocodeAddress(form.from_location);
        const route = await getRoute(from.location, destCoords);
        fromResolved = from.formatted_address;
        toResolved = destResolved || form.to_location;
        meters = route.meters;
      } else {
        const { from, to, route } = await routeByAddresses(form.from_location, form.to_location);
        fromResolved = from.formatted_address;
        toResolved = to.formatted_address;
        meters = route.meters;
      }

      // 2) Distance (km)
      const distanceKm = meters > 0 ? Number((meters / 1000).toFixed(2)) : undefined;

      // 3) Compute fuel cost behind the scenes (no UI changes here)
      const selectedCar = cars.find(c => c.id === form.car_id);
      const lPerKm = getCarLPerKm(selectedCar);

      // a) fetch origin city (from the resolved "From" address)
      let pricePerL = 1.70; // fallback if API fails/quota
      try {
        const geoFrom = await geocodeAddress(fromResolved || form.from_location);
        pricePerL = await fetchCanadaGasPricePerLitre(geoFrom.city);
      } catch (_) {
        // silent fallback
      }

      // b) litres & cost
      const litres = typeof distanceKm === 'number' ? distanceKm * lPerKm : 0;
      const totalCost = litres * pricePerL;

      // 4) Build payload -> parent (Trips.tsx) will save and open confirmation modal
      const payload: Trip = {
        id: '', // let backend set id
        destination: (form.destination?.trim() || toResolved || form.to_location || '').trim(),
        date: form.date || new Date().toISOString(),

        from_location_name: fromResolved || undefined,
        to_location_name: toResolved || undefined,

        from_location: form.from_location || undefined, // raw text/place id
        to_location: form.to_location || undefined,

        passengers: form.passengers || undefined,
        car_id: form.car_id || undefined,

        distance: distanceKm,                           // km
        cost: Number(totalCost.toFixed(2)),             // CAD

        // Optional: stash for later display/debug
        // fuel_price_per_l: Number(pricePerL.toFixed(3)),
        // fuel_liters: Number(litres.toFixed(2)),
        // origin_city: geoFrom.city,
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
