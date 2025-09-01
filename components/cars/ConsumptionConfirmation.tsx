import { Car as CarIcon, Fuel } from "lucide-react-native";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Car } from "../../store/carSlice"; // Import Car interface from carSlice

// Define the props interface
interface ConsumptionConfirmationProps {
  car: Car;
  consumption: number;
  onConfirm: (updatedCar: Car) => void; // Updated to return the modified car
  onReturn: () => void;
}

export default function ConsumptionConfirmation({
  car,
  consumption,
  onConfirm,
  onReturn,
}: ConsumptionConfirmationProps) {
  const handleConfirm = () => {
    const updatedCar: Car = {
      ...car,
      consumption_l_100km: consumption,
      fuel_efficiency: Math.round((235.2 / consumption) * 10) / 10,
    };
    onConfirm(updatedCar); // Pass the updated car back
  };

  return (
    <Modal transparent={false} visible={true} animationType="slide" onRequestClose={onReturn}>
      <View className="flex-1 bg-black justify-center p-4">
        <View className="bg-gray-900 rounded-lg w-full max-w-sm mx-auto">
          <View className="p-4 text-center">
            <Text className="text-3xl justify-center text-center font-bold text-white mb-2 mt-2">About your car</Text>
            <Text className="text-2xl text-center text-gray-400 mt-2">
              Based on the information you provided, your car consumes:
            </Text>
          </View>

          <View className="p-4 text-center space-y-6">
            {/* Car Info */}
            <View className="flex-row items-center justify-center gap-2">
              <CarIcon color="#9CA3AF" size={28} />
              <Text className="text-xl text-white">{car.year} {car.make} {car.model}</Text>
              {car.license_plate && (
                <Text className="text-lg text-gray-300">({car.license_plate})</Text>
              )}
            </View>

            {/* Consumption Display */}
            <View className="bg-gray-700 rounded-lg p-6 mt-4 mb-8">
              <View className="flex items-center justify-center gap-2 mb-2">
                <Fuel color="#10B981" size={32} />
              </View>
              <Text className="text-3xl text-center font-bold text-white mb-2">{consumption} L/100KM</Text>
              <Text className="text-xl text-center text-gray-400 mb-2">OR</Text>
              <Text className="text-2xl text-center font-semibold text-green-400">
                {Math.round((235.2 / consumption) * 10) / 10} MPG
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleConfirm}
                className="w-full justify-center bg-green-400 rounded-lg py-3 items-center mb-3"
              >
                <Text className="text-white text-xl font-bold">OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onReturn}
                className="w-full justify-center border-2 border-gray-700 rounded-lg py-3 items-center"
              >
                <Text className="text-gray-400 text-xl font-bold">RETURN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}