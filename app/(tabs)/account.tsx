import { useRouter } from 'expo-router';
import { Edit, LogOut, Settings, User as UserIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { UserService } from '../../store/all';
import { clearUser, UserState } from '../../store/userSlice';

export default function AccountScreen() {
  const [user, setUser] = useState<UserState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserService.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        address: userData.address || '',
      });
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await UserService.updateMyUserData(formData);
      setIsEditing(false);
      loadUser();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await UserService.logout();
      dispatch(clearUser());
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <View className="w-12 h-12 border-b-2 border-green-400 rounded-full animate-spin" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black" contentContainerClassName="px-6 py-6">
      {/* Header */}
      <View className="items-center mb-6 mt-20">
        <View className="w-32 h-32 bg-green-200/20 rounded-full items-center justify-center mb-4">
          <UserIcon color="#4ade80" size={52} />
        </View>
        <Text className="text-4xl font-bold text-green-400">{user?.full_name || 'User'}</Text>
        <Text className="text-gray-400">{user?.email}</Text>
      </View>

      {/* Profile Information */}
      <View className="bg-gray-900 rounded-xl mb-6">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-2">
            <Settings color="#4ade80" size={22} />
            <Text className="text-xl font-bold text-white">Personal Information</Text>
          </View>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Edit color={isEditing ? 'white' : '#9ca3af'} size={20} />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {isEditing ? (
            <View className="space-y-4">
              {/* Full Name */}
              <View className="space-y-2">
                <Text className="text-white text-xl font-medium mb-2">Full Name</Text>

                {/* Wrapper gives fixed height; TextInput fills it */}
                <View className="h-14 bg-gray-700 border border-gray-600 rounded-lg">
                  <TextInput
                    value={formData.full_name}
                    onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                    placeholder="Enter full name"
                    placeholderTextColor="#9CA3AF"
                    // fill the parent height and remove vertical padding so text is vertically centered
                    style={{
                      height: '100%',
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                      color: '#fff',
                      fontSize: 18,
                      lineHeight: 22,
                      textAlignVertical: 'center', // Android
                    }}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View className="space-y-2">
                <Text className="text-white text-xl font-medium mb-2 mt-2">Phone Number</Text>
                <View className="h-14 bg-gray-700 border border-gray-600 rounded-lg">
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    style={{
                      height: '100%',
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                      color: '#fff',
                      fontSize: 18,
                      lineHeight: 22,
                      textAlignVertical: 'center',
                    }}
                  />
                </View>
              </View>

              {/* Address */}
              <View className="space-y-2">
                <Text className="text-white text-xl font-medium mb-2 mt-2">Address</Text>
                <View className="h-14 bg-gray-700 border border-gray-600 rounded-lg">
                  <TextInput
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholder="Enter address"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      height: '100%',
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                      color: '#fff',
                      fontSize: 18,
                      lineHeight: 22,
                      textAlignVertical: 'center',
                    }}
                  />
                </View>
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  className="flex-1 border border-gray-600 rounded-lg py-3 items-center bg-transparent"
                >
                  <Text className="text-gray-400 text-xl font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-main rounded-lg py-3 items-center border-2 border-green-400"
                >
                  <Text className="text-white text-xl font-medium">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-xl">Full Name</Text>
                <Text className="font-medium text-white">{user?.full_name || 'Not set'}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-xl">Email</Text>
                <Text className="font-medium text-white">{user?.email}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-xl">Phone</Text>
                <Text className="font-medium text-white">{user?.phone || 'Not set'}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-xl">Address</Text>
                <Text className="font-medium text-white">{user?.address || 'Not set'}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Account Actions */}
      <View className="bg-black rounded-xl">
        <View className="p-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full border border-red-600 rounded-lg py-3 items-center bg-transparent"
          >
            <View className="flex-row items-center">
              <LogOut color="#ef4444" size={16} className="mr-2" />
              <Text className="text-red-400 text-xl font-medium">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
