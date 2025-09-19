import { Picker } from '@react-native-picker/picker';
import { Car as CarIcon, MapPin, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Car } from '../../store/carSlice'; // Import Car interface
import { Trip } from '../../store/tripSlice'; // Import Trip interface

interface Props {
  cars: Car[];
  onCalculate: (data: Trip) => void;
  onCancel: () => void;
  isCalculating: boolean;
}

export default function SimplifiedTripForm({
  cars,
  onCalculate,
  onCancel,
  isCalculating,
}: Props) {
  const [form, setForm] = useState<Trip>({
    id: '', // Will be generated later if needed
    destination: '',
    date: '', // Not in form yet, can be added or handled elsewhere
    from_location: '',
    to_location: '',
    passengers: '', // <-- removed default "1"
    car_id: '',
  });

  const canSubmit =
    form.from_location && form.to_location && form.car_id && !isCalculating;

  if (!cars || cars.length === 0) {
    return (
      <Modal transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-gray-900 rounded-xl p-6 w-full max-w-md items-center">
            <Text className="text-xl font-semibold text-white mb-4">
              No cars available
            </Text>
            <Text className="text-gray-400 text-lg text-center mb-6">
              Please add a car before planning a trip.
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              className="bg-main rounded-lg px-4 py-2"
            >
              <Text className="text-white text-lg font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent={false} visible={true} animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white">Where are you going?</Text>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          <View className="space-y-6">
            {/* From */}
            <View>
              <View className="flex-row items-center mb-2">
                <MapPin color="#4ade80" size={18} />
                <Text className="ml-2 text-white text-xl">From</Text>
              </View>

              {/* wrapper sets the fixed height; TextInput fills it */}
              <View className="h-14 mb-2 bg-gray-800 border border-gray-600 rounded-lg">
                <TextInput
                  placeholder="Starting point"
                  value={form.from_location}
                  onChangeText={(text) =>
                    setForm((f) => ({ ...f, from_location: text }))
                  }
                  placeholderTextColor="#9CA3AF"
                  // inline style overrides padding so text is truly centered vertically
                  style={{
                    height: '100%',
                    paddingVertical: 0,
                    paddingHorizontal: 12,
                    color: '#fff',       // ensure typed text is white
                    fontSize: 16,
                    lineHeight: 20,
                    textAlignVertical: 'center', // Android
                  }}
                />
              </View>
            </View>

            {/* To */}
            <View>
              <View className="flex-row items-center mb-2">
                <MapPin color="#4ade80" size={18} />
                <Text className="ml-2 text-white text-xl">To</Text>
              </View>

              <View className="h-14 mb-3 bg-gray-800 border border-gray-600 rounded-lg">
                <TextInput
                  placeholder="Destination"
                  value={form.to_location}
                  onChangeText={(text) =>
                    setForm((f) => ({ ...f, to_location: text }))
                  }
                  placeholderTextColor="#9CA3AF"
                  style={{
                    height: '100%',
                    paddingVertical: 0,
                    paddingHorizontal: 12,
                    color: '#fff',
                    fontSize: 16,
                    lineHeight: 20,
                    textAlignVertical: 'center',
                  }}
                />
              </View>
            </View>

            {/* Passengers & Car */}
            <View className="flex-row space-x-4 gap-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Users color="#4ade80" size={18} />
                  <Text className="ml-2 text-white text-xl">Passengers</Text>
                </View>

                <View className="h-14 bg-gray-800 border border-gray-600 rounded-lg">
                  <TextInput
                    keyboardType="number-pad"
                    value={form.passengers}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, passengers: text }))
                    }
                    placeholder="Number of cotripers"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      height: '100%',
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                      color: '#fff', // ensure typed number is white
                      fontSize: 16,
                      lineHeight: 20,
                      textAlignVertical: 'center',
                      textAlign: 'left',
                    }}
                  />
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <CarIcon color="#4ade80" size={22} />
                  <Text className="ml-2 text-white text-xl">Car</Text>
                </View>
                <View className="bg-gray-800 border border-gray-600 rounded-lg mb-6">
                  <Picker
                    selectedValue={form.car_id}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, car_id: val as string }))
                    }
                    style={{ color: '#1F2937', padding: 10, fontSize: 16 }}
                  >
                    <Picker.Item label="Select car" value="" />
                    {cars.map((c) => (
                      <Picker.Item
                        key={c.id}
                        label={`${c.make} ${c.model}`}
                        value={c.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={() => onCalculate(form)}
              disabled={!canSubmit}
              className={`rounded-lg py-3 ${canSubmit ? 'bg-main' : 'bg-gray-300'} items-center`}
            >
              {isCalculating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-xl font-medium">Next</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
