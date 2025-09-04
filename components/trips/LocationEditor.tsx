import { MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Trip } from '../../store/tripSlice'; // Import Trip interface

interface Props {
  trip: Trip;
  onSave: (data: { from_location_name: string; to_location_name: string }) => void;
  onCancel: () => void;
}

export default function LocationEditor({ trip, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    from_location_name: trip.from_location_name || trip.from_location || '',
    to_location_name: trip.to_location_name || trip.to_location || '',
  });

  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <MapPin color="#4ade80" size={24} />
              <Text className="ml-2 text-2xl text-white font-semibold">Name Locations</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-400 text-xl font-semibold mb-2 mt-2">Point A</Text>
              <TextInput
                value={form.from_location_name}
                onChangeText={(t) => setForm((f) => ({ ...f, from_location_name: t }))}
                className="border border-gray-700 text-gray-400 rounded-lg p-2"
              />
            </View>

            <View>
              <Text className="text-gray-400 text-xl font-semibold mb-2 mt-2">Point B</Text>
              <TextInput
                value={form.to_location_name}
                onChangeText={(t) => setForm((f) => ({ ...f, to_location_name: t }))}
                className="border border-gray-700 text-gray-400 rounded-lg p-2"
              />
            </View>

            <View className="flex-row space-x-2 mt-8">
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 border border-red-600 py-2 rounded-lg items-center mr-2"
              >
                <Text className="text-red-400 text-lg ">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSave(form)}
                className="flex-1 border border-green-400 py-2 rounded-lg items-center ml-2"
              >
                <Text className="text-green-400 text-lg ">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}