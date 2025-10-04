import { Share, ShieldCheck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Trip } from '../../store/tripSlice';

interface TripConfirmationProps {
  trip: Trip;
  onConfirm: (updatedTrip: Trip) => void; // send updated trip up
  onCancel: () => void;
}

export default function TripConfirmation({ trip, onConfirm, onCancel }: TripConfirmationProps) {
  // Compute per-person share and driver savings
  const { totalPeople, sharePerPerson, computedSavings } = useMemo(() => {
    const nPassengers = trip.passengers ? parseInt(trip.passengers, 10) : 0; // passengers exclude driver
    const people = Math.max(1, nPassengers + 1);
    const totalCost = typeof trip.cost === 'number' ? trip.cost : 0;
    const perPerson = people > 0 ? totalCost / people : 0;
    const savings = perPerson * (people - 1);
    return {
      totalPeople: people,
      sharePerPerson: perPerson,
      computedSavings: Number(savings.toFixed(2)),
    };
  }, [trip.passengers, trip.cost]);

  const updatedTrip: Trip = { ...trip, savings: computedSavings };

  return (
    <Modal transparent animationType="slide">
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
          <Text className="text-center text-3xl text-white font-semibold mb-3">
            Plan your trip
          </Text>

          <Text className="text-center text-2xl text-gray-400 mb-4">
            Based on a distance of {trip.distance !== undefined ? trip.distance.toFixed(1) : 'N/A'} km
          </Text>

          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-sm text-neutral-500">Total Trip Cost :</Text>
            <Text className="text-2xl font-bold text-green-400 mb-2">
              ${typeof trip.cost === 'number' ? trip.cost.toFixed(2) : '0.00'}
            </Text>

            <View className="border-t border-gray-200 my-3" />

            <Text className="text-sm text-neutral-500">Share per person :</Text>
            <Text className="text-2xl font-bold text-green-400">
              ${sharePerPerson.toFixed(2)}
            </Text>
            <Text className="text-lg text-gray-400">
              ({totalPeople} people)
            </Text>
          </View>

          <View className="flex-row items-center mb-4">
            <ShieldCheck color="#4ade80" size={23} />
            <Text className="ml-2 text-2xl text-green-400 font-semibold">
              You save ${updatedTrip.savings?.toFixed(2) ?? '0.00'} as the driver
            </Text>
          </View>

          {/* Keep your original Pressable buttons */}
          <Pressable
            onPress={() => onConfirm(updatedTrip)}
            className="bg-main py-2 rounded-lg mb-4 items-center mt-5"
          >
            <Text className="text-white text-xl font-medium">Confirm Trip</Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            className="flex-row justify-center items-center py-2 rounded-lg border border-gray-600"
          >
            <Share color="#10B981" size={16} />
            <Text className="ml-2 text-main text-xl">Share with Passengers</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
