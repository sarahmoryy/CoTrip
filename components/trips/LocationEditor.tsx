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
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-xl p-6 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <MapPin color="#4ade80" size={16} />
              <Text className="ml-2 text-lg font-semibold">Name Locations</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-1">Point A</Text>
              <TextInput
                value={form.from_location_name}
                onChangeText={(t) => setForm((f) => ({ ...f, from_location_name: t }))}
                className="border border-gray-300 rounded-md p-2"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-1">Point B</Text>
              <TextInput
                value={form.to_location_name}
                onChangeText={(t) => setForm((f) => ({ ...f, to_location_name: t }))}
                className="border border-gray-300 rounded-md p-2"
              />
            </View>

            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 border border-gray-300 py-2 rounded-md items-center"
              >
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSave(form)}
                className="flex-1 bg-green-500 py-2 rounded-md items-center"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}