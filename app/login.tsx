import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { auth } from '../FirebaseConfig';

const logoIcon = require("../assets/images/Car_Auto.png");

export default function LoginScreen() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const signin = async () => {
    console.log("TEST");
    try {
      const user = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log(user);
      if (user) router.replace('/(tabs)/home');
    } catch (error: any) {
      console.log(error);
      alert('sign in error' + error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black" contentContainerClassName="px-6 py-12 ">
      {/* Header */}
      <View className="items-center mb-4">
        <View className="w-20 h-20 bg-black rounded-full items-center justify-center mb-6 mt-24">
          <Image source={logoIcon} style={{ width: 86, height: 86 }} resizeMode="contain" />
        </View>
        <Text className="text-7xl font-semibold text-green-400 mb-11">CoTrip</Text>
      </View>

      {/* Form Card */}
      <View className="bg-gray-900 rounded-xl p-6 mb-6">
        <View className="space-y-6">
          {/* Email */}
          <View className="space-y-2">
            <Text className="text-white text-xl font-medium mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-800 rounded-lg mb-2 h-14">
              <Mail color="#9ca3af" size={20} style={{ marginLeft: 8, marginRight: 8 }} />
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  flex: 1,
                  color: '#fff',
                  fontSize: 18,
                  lineHeight: 22,
                  height: '100%',
                  paddingVertical: 0,
                  textAlignVertical: 'center',
                }}
              />
            </View>
          </View>

          {/* Password */}
          <View className="space-y-2">
            <Text className="text-white text-xl font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-800 rounded-lg mb-6 h-14">
              <Lock color="#9ca3af" size={20} style={{ marginLeft: 8, marginRight: 8 }} />
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Enter password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={{
                  flex: 1,
                  color: '#fff',
                  fontSize: 18,
                  lineHeight: 22,
                  height: '100%',
                  paddingVertical: 0,
                  textAlignVertical: 'center',
                }}
              />
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={signin}
            className="bg-main rounded-lg py-3 items-center "
            disabled={loading}
          >
            <Text className="text-white text-lg font-medium">
              {loading ? 'Processing...' : 'SIGN IN'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Account Link */}
      <View className="items-center mt-8">
        <Text className="text-gray-400 text-2xl mb-4">New to carpooling? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text className="text-main text-xl font-medium">Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
