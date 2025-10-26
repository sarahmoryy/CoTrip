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
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl w-full max-w-md mx-auto">
          <View className="flex-row justify-between items-center mb-3 p-4 border-b border-gray-700">
            <Text className="text-2xl text-white font-medium">
              CoTrip on {trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#9CA3AF" size={28} />
            </TouchableOpacity>
          </View>

          <ScrollView className="space-y-4">
            {/* Route */}
            <View className="bg-white rounded-lg p-5">
              <View className="flex-row items-center mb-2 mt-1">
                <MapPin color="#4ade80" size={22} />
                <Text className="ml-2 text-gray-400 text-xl font-medium">
                  {trip.from_location_name || trip.from_location || 'Unknown'}
                </Text>
              </View>
              <View className="bg-gray-300 mb-2" />
              <View className="flex-row items-center">
                <MapPin color="#ef4444" size={22} />
                <Text className="ml-2 text-gray-400 text-xl font-medium">
                  {trip.to_location_name || trip.to_location || 'Unknown'}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View className="bg-gray-50 rounded-lg p-6 space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-white text-lg mb-1">Car:</Text>
                <Text className="font-medium text-main text-lg">
                  {car ? `${car.year} ${car.make} ${car.model}` : 'N/A'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white text-lg mb-1">Passengers:</Text>
                <Text className="font-medium text-main text-lg">{trip.passengers || 'N/A'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white text-lg mb-1">Distance:</Text>
                <Text className="font-medium text-main text-lg">{trip.distance !== undefined ? `${trip.distance} mi` : 'N/A'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white text-lg mb-1">Savings:</Text>
                <Text className="font-medium text-main text-lg mb-4">
                  ${trip.savings !== undefined ? trip.savings.toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              onPress={onEditLocations}
              className="flex-row items-center justify-center border border-gray-600 py-2 rounded-lg mb-6 ml-3 mr-3"
            >
              <Edit color="#4ade80" size={16} />
              <Text className="ml-2 text-green-400 text-lg">Edit Trip</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}