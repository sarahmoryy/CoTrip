import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Car as CarIcon, DollarSign, PlusIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CarService, SavingsService, TripService, UserService } from "../../store/all";
import { Car } from "../../store/carSlice";
import { SavingsRecord } from "../../store/savingsSlice";
import { Trip } from "../../store/tripSlice";
import { UserState } from "../../store/userSlice";

const logoIcon = require("../../assets/images/Car_Auto.png");

export default function HomeScreen() {
  const [user, setUser] = useState<UserState | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await UserService.me();
      const tripsData = await TripService.list("-created_date", 5);
      const carsData = await CarService.list();
      const savingsData = await SavingsService.list(); 

      setUser(userData);
      setTrips(tripsData);
      setCars(carsData);

      const currentMonth = format(new Date(), "yyyy-MM");
      const monthSavings = savingsData.filter((s: SavingsRecord) => s.month === currentMonth);
      const monthlyTotal = monthSavings.reduce((sum, s) => sum + (s.amount || 0), 0);
      setMonthlyEarnings(monthlyTotal);

      const total = savingsData.reduce((sum, s) => sum + (s.amount || 0), 0);
      setTotalSavings(total);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black p-5">
      <View className="items-center mb-6">
        <View className="bg-main w-24 h-24 rounded-full justify-center items-center mb-8 mt-16">
          <Image source={logoIcon} style={{ width: 52, height: 52 }} resizeMode="contain" />
        </View>
        <Text className="text-white text-4xl font-bold mb-5">Hello {user?.full_name || "X"},</Text>
        <Text className="text-gray-400 text-2xl">You have saved</Text>
        <Text className="text-4xl text-green-400 font-bold my-2">${monthlyEarnings.toFixed(2)}</Text>
        <Text className="text-gray-400 text-2xl mb-2">with {trips.length} CoTrips this month</Text>
      </View>

      <View className="flex-row justify-between space-x-4 gap-4 ">
        <View className="flex-1 bg-gray-900 rounded-xl p-5 items-center mb-5">
          <DollarSign color="#10B981" size={32} />
          <Text className="text-white text-2xl font-bold mt-2">${totalSavings.toFixed(0)}</Text>
          <Text className="text-gray-400 text-xl mt-1">Total Savings</Text>
        </View>
        <View className="flex-1 bg-gray-900 rounded-xl p-5 items-center mb-5">
          <CarIcon color="#10B981" size={32} />
          <Text className="text-white text-2xl font-bold mt-2">{cars.length}</Text>
          <Text className="text-gray-400 text-xl mt-1">Your Cars</Text>
        </View>
      </View>

      <View className="bg-gray-900 rounded-xl p-4 mb-2">
        <Text className="text-white text-xl font-bold mb-3">This past week:</Text>
        {trips.length > 0 ? (
          trips.slice(0, 3).map((trip) => (
            <View key={trip.id} className="flex-row justify-between items-center mb-3">
              <View className="flex-1">
                <Text className="text-white">{format(new Date(trip.date), "MMM d")}:</Text>
                <Text className="text-gray-400 text-sm">
                  From {trip.from_location} → {trip.to_location}
                </Text>
              </View>
              <Text className="text-main font-semibold">${(trip.savings || 0).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-400 text-lg">No recent trips</Text>
        )}
      </View>

      <View className="flex-row justify-around p-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center px-1 py-3 bg-main rounded-lg mr-3"
          onPress={() => router.push("/(tabs)/trips")}
        >
          <PlusIcon className="w-5 h-5 mr-5" color="white" />
          <Text className="text-white text-xl ml-3 font-semibold">New Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center px-1 py-3 bg-main rounded-lg ml-3"
          onPress={() => router.push("/(tabs)/cars")}
        >
          <CarIcon className="w-6 h-6 mr-5" color="white" />
          <Text className="text-white text-xl ml-3 font-semibold">Add Car</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}