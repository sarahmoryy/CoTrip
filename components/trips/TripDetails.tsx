import { Edit, MapPin, X } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Car } from '../../store/carSlice'; // Import Car interface
import { Trip } from '../../store/tripSlice'; // Import Trip interface

interface Props {
  trip: Trip;
  cars: Car[];
  onEditLocations: () => void;
  onClose: () => void;
}

export default function TripDetails({
  trip,
  cars,
  onEditLocations,
  onClose,
}: Props) {
  const car = cars.find((c) => c.id === trip.car_id);

  return (
    <Modal transparent animationType="slide">
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="bg-white rounded-xl p-4 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">
              Trip on {trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView className="space-y-4">
            {/* Route */}
            <View className="bg-gray-100 rounded-lg p-3">
              <View className="flex-row items-center mb-2">
                <MapPin color="#4ade80" size={16} />
                <Text className="ml-2 text-neutral-800 truncate">
                  {trip.from_location_name || trip.from_location || 'Unknown'}
                </Text>
              </View>
              <View className="h-1 bg-gray-300 mb-2" />
              <View className="flex-row items-center">
                <MapPin color="#ef4444" size={16} />
                <Text className="ml-2 text-neutral-800 truncate">
                  {trip.to_location_name || trip.to_location || 'Unknown'}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View className="bg-gray-50 rounded-lg p-3 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Car:</Text>
                <Text className="font-medium">
                  {car ? `${car.year} ${car.make} ${car.model}` : 'N/A'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Passengers:</Text>
                <Text className="font-medium">{trip.passengers || 'N/A'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Distance:</Text>
                <Text className="font-medium">{trip.distance !== undefined ? `${trip.distance} mi` : 'N/A'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Savings:</Text>
                <Text className="font-medium text-green-500">
                  ${trip.savings !== undefined ? trip.savings.toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              onPress={onEditLocations}
              className="flex-row items-center justify-center border border-green-500 py-2 rounded-md"
            >
              <Edit color="#4ade80" size={16} />
              <Text className="ml-2 text-green-500">Edit Locations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-green-500 py-2 rounded-md items-center"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}