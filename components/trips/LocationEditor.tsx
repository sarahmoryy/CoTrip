// src/components/trips/LocationEditor.tsx
import { computeTripOneWay } from '@/assets/utils/computeTrips';
import AutocompleteInput from '@/components/AutoComplete';
import type { Car } from '@/store/carSlice';
import { TripService } from '@/store/tripService';
import type { Trip } from '@/store/tripSlice';
import { updateTrip } from '@/store/tripSlice';
import { Picker } from '@react-native-picker/picker';
import { Car as CarIcon, MapPin, Users, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

interface Props {
  trip: Trip;
  car: Car;
  carList: Car[]; // full list of cars for selection
  passengers?: string | number;
  onCancel: () => void;
}

export default function LocationEditor({ trip, car, carList, onCancel }: Props) {
  const dispatch = useDispatch();

  // Form state for From/To
  const [form, setForm] = useState({
    from_location_name: trip.from_location_name || trip.from_location || '',
    to_location_name: trip.to_location_name || trip.to_location || '',
  });

  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);

  // Passengers and Car state
  const [passengersValue, setPassengersValue] = useState(trip.passengers ?? '0');
  const [selectedCarId, setSelectedCarId] = useState(trip.car_id ?? car.id);

  const canSave = useMemo(
    () =>
      form.from_location_name.trim().length > 0 &&
      form.to_location_name.trim().length > 0 &&
      !busy,
    [form, busy]
  );

  const handleSave = async () => {
    try {
      setBusy(true);

      const nPassengers = parseInt(passengersValue || '0', 10);

      const selectedCar = carList.find((c) => c.id === selectedCarId) ?? car;

      // 1) Recalculate (one-way)
      const m = await computeTripOneWay({
        fromText: form.from_location_name,
        toText: form.to_location_name,
        car: selectedCar,
        passengers: nPassengers,
        fromCoords,
        toCoords,
      });

      // 2) Savings using TripConfirmation formula
      const people = nPassengers + 1; // include driver
      const perPerson = people > 0 ? m.totalCost / people : 0;
      const computedSavings = Number((perPerson * nPassengers).toFixed(2));

      // 3) Build patch
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

      // 4) Optimistic update
      dispatch(updateTrip({ id: trip.id, tripData: patch }));

      // 5) Persist to backend
      await TripService.update(trip.id, patch);

      // 6) Close modal
      onCancel();
    } catch (e: any) {
      console.warn('LocationEditor save error:', e?.message ?? e);
      Alert.alert('Save failed', e?.message ?? 'Could not update the trip.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <MapPin color="#4ade80" size={24} />
              <Text className="ml-2 text-2xl text-white font-semibold">Name & Modify Trip</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          {/* From */}
          <View className="mt-2" style={{ zIndex: 60 }}>
            <Text className="text-gray-400 text-xl font-semibold mb-1">From:</Text>
            <AutocompleteInput
              label=""
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

          {/* To */}
          <View className="mt-4" style={{ zIndex: 50, marginBottom: 2 }}>
            <Text className="text-gray-400 text-xl font-semibold mb-1">To:</Text>
            <AutocompleteInput
              label=""
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

          {/* Passengers */}
          <View className="mt-4">
            <View className="flex-row items-center mb-2">
              <Users color="#4ade80" size={18} />
              <Text className="ml-2 text-gray-400 text-xl font-semibold">Passengers:</Text>
            </View>
            <View className="h-14 bg-gray-800 border border-gray-600 rounded-lg">
              <TextInput
                keyboardType="number-pad"
                value={passengersValue}
                onChangeText={(text) => setPassengersValue(text.replace(/[^0-9]/g, ''))}
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

          {/* Car */}
          <View className="mt-4" style={{ marginBottom: 10 }}>
            <View className="flex-row items-center mb-2">
              <CarIcon color="#4ade80" size={18} />
              <Text className="ml-2 text-gray-400 text-xl font-semibold">Car:</Text>
            </View>
            <View className="bg-gray-800 border border-gray-600 rounded-lg mb-4">
              <Picker
                selectedValue={selectedCarId}
                onValueChange={(val) => setSelectedCarId(val)}
                style={{ color: '#fff', padding: 10, fontSize: 16 }}
              >
                {carList.map((c) => (
                  <Picker.Item key={c.id} label={`${c.make} ${c.model}`} value={c.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row space-x-2 mt-6">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 border border-red-600 py-2 rounded-lg items-center mr-2"
              disabled={busy}
            >
              <Text className="text-red-400 text-lg">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              className={`flex-1 py-2 rounded-lg items-center ml-2 ${
                canSave ? 'border border-green-400' : 'border border-gray-600 opacity-60'
              }`}
            >
              {busy ? (
                <ActivityIndicator color="#4ade80" />
              ) : (
                <Text className={`${canSave ? 'text-green-400' : 'text-gray-400'} text-lg`}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
