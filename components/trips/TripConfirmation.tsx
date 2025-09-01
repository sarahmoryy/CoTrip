import { Share, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Trip } from '../../store/tripSlice'; // Import Trip interface

interface TripConfirmationProps {
  trip: Trip;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TripConfirmation({
  trip,
  onConfirm,
  onCancel,
}: TripConfirmationProps) {
  const totalPeople = (trip.passengers ? parseInt(trip.passengers) : 0) + 1;
  const sharePerPerson = totalPeople > 0 && trip.cost !== undefined ? trip.cost / totalPeople : trip.cost || 0;

  return (
    <Modal transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-xl p-6 w-full max-w-sm">
          <Text className="text-center text-lg font-semibold mb-2">
            Plan your trip
          </Text>
          <Text className="text-center text-sm text-neutral-500 mb-4">
            Based on a distance of {trip.distance !== undefined ? trip.distance.toFixed(1) : 'N/A'} miles
          </Text>

          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-sm text-neutral-500">Total Trip Cost</Text>
            <Text className="text-2xl font-bold text-green-500">
              ${trip.cost !== undefined ? trip.cost.toFixed(2) : '0.00'}
            </Text>
            <View className="border-t border-gray-200 my-3" />
            <Text className="text-sm text-neutral-500">Share per person</Text>
            <Text className="text-xl font-bold text-neutral-800">
              ${sharePerPerson.toFixed(2)}
            </Text>
            <Text className="text-xs text-neutral-500">
              ({totalPeople} people)
            </Text>
          </View>

          <View className="flex-row items-center bg-green-100 p-3 rounded-lg mb-4">
            <ShieldCheck color="#4ade80" size={20} />
            <Text className="ml-2 text-sm text-green-600">
              You save ${trip.savings !== undefined ? trip.savings.toFixed(2) : '0.00'} as driver
            </Text>
          </View>

          <TouchableOpacity
            onPress={onConfirm}
            className="bg-green-500 py-3 rounded-md mb-2 items-center"
          >
            <Text className="text-white font-medium">Confirm Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            className="flex-row justify-center items-center py-3 rounded-md border border-neutral-300"
          >
            <Share color="#4ade80" size={16} />
            <Text className="ml-2 text-green-500">Share with Passengers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}