import { DollarSign, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native';
import { SavingsService } from '../../store/all';
import { SavingsRecord } from '../../store/savingsSlice';

export default function SavingsScreen() {
  const [savings, setSavings] = useState<SavingsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savingsData = await SavingsService.list("-created_date");
      setSavings(savingsData);
    } catch (error) {
      console.error('Error loading savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSavings = savings.reduce((sum, s) => sum + (s.amount || 0), 0);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <ScrollView className= "flex-1 bg-black" contentContainerClassName="px-5 pb-10">
      {/* Header */}
      <View className="items-center mb-5 mt-20">
        <Text className="text-3xl font-bold text-white mb-2">All Savings</Text>
        <Text className="text-gray-400 text-xl font-semibold mb-2">Track your carpooling savings</Text>
      </View>

      {/* Total Savings Card */}
      <View className="bg-gray-900 rounded-xl p-5 mb-5">
        <View className="bg-green-200/10 w-16 h-16 rounded-full items-center justify-center mx-auto mb-4">
          <DollarSign color="#10B981" size={32} />
        </View>
        <Text className="text-4xl font-bold mb-1 text-green-400 text-center">${totalSavings.toFixed(2)}</Text>
        <Text className="text-center text-gray-400 mb-2 text-lg">Total Savings</Text>
        <View className="flex-row justify-center items-center">
          <TrendingUp color="#4ade80" size={16} />
          <Text className="text-main ml-1 text-xl">Great progress!</Text>
        </View>
      </View>

      {/* Savings History */}
      <View className="bg-gray-900 rounded-xl p-5 mb-5 mt-1">
        <Text className="text-xl font-bold text-white mb-3">Savings History</Text>
        {savings.length > 0 ? (
          <FlatList
            data={savings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-gray-700 p-3 rounded-lg mb-2.5 flex-row justify-between">
                <View>
                  <Text className="text-white font-medium">
                    {item.description || 'Unnamed Saving'}
                  </Text>
                  <Text className="text-gray-400 text-xs">{item.month}</Text>
                </View>
                <Text className="text-green-400 font-semibold">+${item.amount.toFixed(2)}</Text>
              </View>
            )}
          />
        ) : (
          <View className="items-center py-8">
            <DollarSign color="#9ca3af" size={48} />
            <Text className="text-gray-400 mt-5 text-xl mb-1 ">No savings recorded yet</Text>
            <Text className="text-gray-500 mt-1 text-sm text-center">
              Complete trips to start tracking savings
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}