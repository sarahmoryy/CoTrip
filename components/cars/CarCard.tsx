import { Car as CarIcon, Edit, Fuel, Trash2 } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Car } from "../../store/carSlice"; // Import Car from carSlice

// Define the props interface
interface CarCardProps {
  car: Car;
  onEdit: (car: Car) => void; // Function that takes a car object and returns void
  onDelete: (carId: string) => void; // Function that takes a car ID and returns void
}

export default function CarCard({ car, onEdit, onDelete }: CarCardProps) {
  return (
    <View className="bg-gray-900 rounded-xl mb-4 shadow-sm">
      <View className="p-6">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <CarIcon color="#9CA3AF" size={32} />
            </View>
            <View>
              <Text className="font-semibold text-xl text-white">
                {car.make} {car.model}
              </Text>
              <Text className="text-gray-400 text-lg mt-1">{car.year}</Text>
            </View>
          </View>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => onEdit(car)}
              
            >
              <Edit color="#9CA3AF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(car.id)}
              
            >
              <Trash2 color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-xl text-gray-400">
              <Fuel color="#9CA3AF" size={18} style={{marginRight:8}}/>
             Consumption
            </Text>
            <Text className="text-xl font-medium text-green-400">
              {car.consumption_l_100km
                ? `${car.consumption_l_100km} L/100km`
                : `${car.fuel_efficiency || 25} MPG`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}