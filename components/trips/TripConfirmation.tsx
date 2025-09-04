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
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
          <Text className="text-center text-3xl text-white font-semibold mb-3">
            Plan your trip
          </Text>
          <Text className="text-center text-2xl text-gray-400 mb-4">
            Based on a distance of {trip.distance !== undefined ? trip.distance.toFixed(1) : 'N/A'} miles
          </Text>

          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-xl text-white font-bold mb-2">Total Trip Cost : </Text>
            <Text className="text-2xl font-bold text-green-400 mb-2">
              ${trip.cost !== undefined ? trip.cost.toFixed(2) : '0.00'}
            </Text>
            <View className="border-t border-gray-200 my-3" />
            <Text className="text-xl text-white font-bold mb-2">Share per person : </Text>
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
              You save ${trip.savings !== undefined ? trip.savings.toFixed(2) : '0.00'} as the driver
            </Text>
          </View>

          <TouchableOpacity
            onPress={onConfirm}
            className="bg-main py-2 rounded-lg mb-4 items-center mt-5"
          >
            <Text className="text-white text-xl font-medium " >Confirm Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            className="flex-row justify-center items-center py-2 rounded-lg border border-gray-600"
          >
            <Share color="#10B981" size={16} />
            <Text className="ml-2 text-main text-xl">Share with Passengers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}