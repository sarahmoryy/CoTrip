import { Picker } from "@react-native-picker/picker";
import { Car as CarIcon, Loader2, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Car } from "../../store/carSlice"; // Import Car interface from carSlice

// Popular car makes for the dropdown
const CAR_MAKES = [
  "Audi", "BMW", "Chevrolet", "Ford", "Honda", "Hyundai", "Kia", "Mazda",
  "Mercedes-Benz", "Nissan", "Subaru", "Toyota", "Volkswagen", "Volvo",
];

// Define the props interface
interface CarFormProps {
  car: Car | null;
  onSave: (carData: Car) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function CarForm({ car, onSave, onCancel, isSaving }: CarFormProps) {
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year?.toString() || "",
    license_plate: car?.license_plate || "", // Optional field
    consumption_l_100km: car?.consumption_l_100km?.toString() || "", // New consumption field
  });

  const handleSubmit = () => {
    const carData: Car = {
      id: car?.id || "", // Will be overridden by uuidv4 in CarsScreen if new
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year) || 0,
      license_plate: formData.license_plate || undefined, // Optional, set to undefined if empty
      consumption_l_100km: formData.consumption_l_100km ? parseFloat(formData.consumption_l_100km) : undefined,
      fuel_efficiency: car?.fuel_efficiency, // Preserve existing value if editing
    };
    onSave(carData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => (currentYear + 1 - i).toString());

  return (
    <Modal transparent={false} visible={true} animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 bg-black justify-center p-4">
        <View className="bg-gray-900 rounded-lg w-full max-w-md mx-auto">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-row items-center gap-2">
              <CarIcon color="#10B981" size={28} />
              <Text className="text-2xl font-bold text-white ml-3">
                {car ? "Edit Car" : "Add new car"}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} className="p-1">
              <X color="#9CA3AF" size={26} />
            </TouchableOpacity>
          </View>

          <View className="p-4 space-y-4">
            {/* Car Make */}
            <View className="space-y-2">
              <Text className="text-white text-xl font-bold mb-2">Car Brand</Text>
              <View className="bg-gray-800 rounded-lg border border-gray-600">
                <Picker
                  selectedValue={formData.make}
                  onValueChange={(value) => handleChange("make", value)}
                  style={{ color: "#FFFFFF", padding: 10 }}
                  dropdownIconColor="#9CA3AF"
                >
                  <Picker.Item label="Select brand" value="" />
                  {CAR_MAKES.map((make) => (
                    <Picker.Item key={make} label={make} value={make} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Car Model */}
            <View className="space-y-2">
              <Text className="text-white text-xl mt-2 font-bold">Model</Text>
              <TextInput
                placeholder="Enter model"
                value={formData.model}
                onChangeText={(value) => handleChange("model", value)}
                className="bg-gray-800 border border-gray-600 text-white text-xl p-2 rounded-lg mt-2"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Car Year */}
            <View className="space-y-2">
              <Text className="text-white text-xl font-bold mt-2 mb-2">Year</Text>
              <View className="bg-gray-800 rounded-lg border border-gray-600">
                <Picker
                  selectedValue={formData.year}
                  onValueChange={(value) => handleChange("year", value)}
                  style={{ color: "#FFFFFF", padding: 10 }}
                  dropdownIconColor="#9CA3AF"
                >
                  <Picker.Item label="Select year" value="" />
                  {years.map((year) => (
                    <Picker.Item key={year} label={year} value={year} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Action Button */}
            <View className="pt-4 flex justify-center">
              <TouchableOpacity
                onPress={handleSubmit}
                className="w-full bg-main justify-center rounded-lg px-2 py-2 items-center mt-5 mx-auto"
                disabled={isSaving || !formData.make || !formData.model || !formData.year}
              >
                {isSaving ? (
                  <View className="flex-row items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" color="white" />
                    <Text className="text-white text-2xl font-medium">Getting consumption data...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-2xl font-medium">ADD</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}