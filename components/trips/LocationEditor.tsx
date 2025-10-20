// src/components/trips/LocationEditor.tsx
import { computeTripOneWay } from '@/assets/utils/computeTrips';
import AutocompleteInput from '@/components/AutoComplete';
import type { Car } from '@/store/carSlice';
import { TripService } from '@/store/tripService';
import type { Trip } from '@/store/tripSlice';
import { updateTrip } from '@/store/tripSlice';
import { MapPin, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

interface Props {
  trip: Trip;
  car: Car;
  passengers?: number | string; // still accepted, but we use trip.passengers first
  onCancel: () => void;
}

export default function LocationEditor({
  trip,
  car,
  passengers = trip.passengers ?? '0', // passengers EXCLUDE driver; default to 0
  onCancel,
}: Props) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    from_location_name: trip.from_location_name || trip.from_location || '',
    to_location_name: trip.to_location_name || trip.to_location || '',
  });

  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);

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

      // 1) Recalculate (one-way)
      const m = await computeTripOneWay({
        fromText: form.from_location_name,
        toText: form.to_location_name,
        car,
        // We still pass passengers for any helper-side per-person needs,
        // but savings below uses the TripConfirmation rule explicitly.
        passengers: passengers,
        fromCoords,
        toCoords,
      });

      // 2) Savings using TripConfirmation formula:
      // passengers exclude driver
      const nPassengers =
        typeof (trip.passengers ?? passengers) !== 'undefined'
          ? Math.max(0, parseInt(String(trip.passengers ?? passengers ?? '0'), 10) || 0)
          : 0;
      const people = nPassengers + 1; // add driver
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
        savings: computedSavings, // ✅ matches TripConfirmation

        // keep these consistent if parent relies on them
        passengers: String(nPassengers), // store as string, excludes driver
        destination: trip.destination ?? m.toResolved ?? form.to_location_name,
        date: trip.date ?? new Date().toISOString(),
        car_id: trip.car_id ?? car.id,
      };

      // 4) Optimistic update so TripCard updates instantly
      dispatch(updateTrip({ id: trip.id, tripData: patch }));

      // 5) Persist to backend
      await TripService.update(trip.id, patch);

      // 6) Close
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
              <Text className="ml-2 text-2xl text-white font-semibold">Name Locations</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          {/* Point A */}
          <View className="mt-2" style={{ zIndex: 60 }}>
            <Text className="text-gray-400 text-xl font-semibold mb-2">Point A</Text>
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

          {/* Point B */}
          <View className="mt-6" style={{ zIndex: 50 }}>
            <Text className="text-gray-400 text-xl font-semibold mb-2">Point B</Text>
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

          {/* Actions */}
          <View className="flex-row space-x-2 mt-8">
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
