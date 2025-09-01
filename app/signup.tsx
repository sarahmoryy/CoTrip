import { useRouter } from 'expo-router';
import { Lock, Mail, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserService } from '../store/all';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await UserService.signup(formData.full_name, formData.email, formData.password, formData.confirmPassword);
      Alert.alert('Success', 'Account created! Please log in.');
      router.push('/login'); // Redirect to login screen after sign-up
    } catch (error) {
      console.error('Error:', error);
      // Type guard to assert error is an Error object
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black" contentContainerClassName="px-6 py-12">
      {/* Header */}
      <View className="items-center mb-8 mt-16">
        <View className="w-28 h-28 bg-main/20 rounded-full items-center justify-center mb-4">
          <UserIcon color="#4ade80" size={55} />
        </View>
        <Text className="text-3xl font-bold text-main mt-2 mb-2">Create Account</Text>
        <Text className="text-gray-400 text-xl text-center">Set up your account</Text>
      </View>

      {/* Form Card */}
      <View className="bg-gray-900 rounded-xl p-6 mb-6">
        <View className="space-y-6">
          <View className="space-y-2">
            <Text className="text-white text-xl font-medium mb-2">Full Name</Text>
            <View className="flex-row items-center bg-gray-800 rounded-lg mb-2">
              <TextInput
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                className="flex-1 text-white text-lg p-2"
                placeholder="Enter full name"
              />
            </View>
          </View>
          <View className="space-y-2">
            <Text className="text-white text-xl font-medium mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-800 rounded-lg mb-2">
              <Mail color="#9ca3af" size={20} style={{marginLeft:8}} />
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                className="flex-1 text-white text-lg p-2"
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          <View className="space-y-2">
            <Text className="text-white text-xl font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-800 rounded-lg mb-2">
              <Lock color="#9ca3af" size={20} style={{marginLeft:8}} />
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                className="flex-1 text-white text-lg p-2"
                placeholder="Enter password"
                secureTextEntry
              />
            </View>
          </View>
          <View className="space-y-2">
            <Text className="text-white text-xl font-medium mb-2">Confirm Password</Text>
            <View className="flex-row items-center bg-gray-800 rounded-lg mb-5">
              <Lock color="#9ca3af" size={20} style={{marginLeft:8}} />
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                className="flex-1 text-white text-lg p-2"
                placeholder="Confirm password"
                secureTextEntry
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-main rounded-lg py-3 items-center "
            disabled={loading}
          >
            <Text className="text-white text-lg font-medium">
              {loading ? 'Processing...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back to Login Link */}
      <View className="items-center">
        <Text className="text-gray-400 text-xl mb-2">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text className="text-main text-xl font-medium">Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}