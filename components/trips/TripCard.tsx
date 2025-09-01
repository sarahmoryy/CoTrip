import { Calendar, Car as CarIcon, MapPin, ShieldCheck, Trash2, Users } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Car } from '../../store/carSlice';
import { Trip } from '../../store/tripSlice';

interface TripCardProps {
  trip: Trip;
  cars: Car[];
  onClick: () => void;
  onDelete: (tripId: string) => void; 
}

export default function TripCard({ trip, cars, onClick, onDelete }: TripCardProps) {
  console.log("TripCard props:", { trip, cars }); 
  const car = cars.find((c) => c.id === trip.car_id);

  return (
    <TouchableOpacity
      onPress={onClick}
      className="bg-gray-900 rounded-xl shadow p-4 mb-4"
    >
      {/* Header */}
      <View className="flex-row justify-between mb-3">
        <View className="pr-2"> {/* Removed flex-1 to allow natural width */}
          <View className="flex-row items-center mb-1">
            <MapPin color="#4ade80" size={20} />
            <Text className="ml-1 font-medium text-white text-xl"> {/* Removed truncate */}
              {trip.from_location_name || trip.from_location || 'Unknown'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-white text-xl ">→</Text>
            <Text className="ml-1 text-white text-xl mb-2"> {/* Removed truncate */}
              {trip.to_location_name || trip.to_location || 'Unknown'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onDelete(trip.id)}>
          <Trash2 color="#9CA3AF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View className="flex-row justify-between mb-3">
        <View className="flex-row items-center w-1/2 mb-2">
          <Calendar color="#9CA3AF" size={17} />
          <Text className="ml-1 text-sm text-gray-400">
            {trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View className="flex-row items-center w-1/2 mb-2">
          <Users color="#9CA3AF" size={17} />
          <Text className="ml-1 text-sm text-gray-400">
            {trip.passengers ? `${trip.passengers} passenger${parseInt(trip.passengers) !== 1 ? 's' : ''}` : 'N/A'}
          </Text>
        </View>
        {trip.savings !== undefined && trip.savings > 0 && (
          <View className="flex-row items-end ml-2">
            <ShieldCheck color="#4ade80" size={17} />
            <Text className="ml-1 text-lg text-green-400">
              ${trip.savings.toFixed(2)} saved
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-2 border-t border-neutral-200">
        <View className="flex-row items-center">
          {car && (
            <>
              <CarIcon color="#9CA3AF" size={17} />
              <Text className="ml-1 text-sm text-neutral-600">
                {car.make} {car.model}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}