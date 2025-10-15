// app/(tabs)/savings.tsx
import { DollarSign, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  selectTotalSavingsFromTrips,
  selectTrips,
  Trip
} from '../../store/tripSlice';

// Locale-aware CAD formatter — always 2 decimals
const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmt = (v: number) => currency.format(Number(v || 0));

function monthKeyFromDateStr(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(key: string): string {
  const [yStr, mStr] = key.split('-');
  const y = Number(yStr), m = Number(mStr);
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[(m || 1) - 1]} ${y}`;
}

function addMonths(key: string, delta: number): string {
  const [yStr, mStr] = key.split('-');
  const y = Number(yStr), m = Number(mStr) - 1;
  const d = new Date(y, m, 1);
  d.setMonth(d.getMonth() + delta);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

function monthsRange(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let cur = startKey;
  while (cur <= endKey) {
    out.push(cur);
    cur = addMonths(cur, 1);
  }
  return out;
}

export default function SavingsScreen() {
  const trips = useSelector(selectTrips);
  const totalSavings = useSelector(selectTotalSavingsFromTrips);
  const loading = useSelector((s: any) => s.trip?.loading) ?? false;

  // Build continuous month range + totals (floats preserved)
  const { bars, maxValue } = useMemo(() => {
    const totals = new Map<string, number>();
    let minKey: string | null = null;
    let maxKey: string | null = null;

    for (const t of (trips as Trip[])) {
      const key = monthKeyFromDateStr(t.date);
      if (!key) continue;
      const val = Number(t.savings ?? 0); // ensure number, keep decimals
      totals.set(key, (totals.get(key) ?? 0) + val);
      if (!minKey || key < minKey) minKey = key;
      if (!maxKey || key > maxKey) maxKey = key;
    }

    // No trips: show last 6 months as zeros
    if (!minKey || !maxKey) {
      const today = new Date();
      const endKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const startKey = addMonths(endKey, -5);
      const keys = monthsRange(startKey, endKey);
      const arr = keys.map(k => ({ key: k, value: 0 }));
      return { bars: arr, maxValue: 1 };
    }

    // Fill missing months with 0
    const keys = monthsRange(minKey, maxKey);
    const arr = keys.map(k => ({ key: k, value: Number(totals.get(k) ?? 0) }));

    const maxV = Math.max(1, ...arr.map(b => b.value));
    return { bars: arr, maxValue: maxV };
  }, [trips]);

  if (loading && trips.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black" contentContainerClassName="px-5 pb-10">
      {/* Header */}
      <View className="items-center mb-5 mt-20">
        <Text className="text-3xl font-bold text-white mb-2">All Savings</Text>
        <Text className="text-gray-400 text-xl font-semibold mb-2">
          Calculated from your trips
        </Text>
      </View>

      {/* Total Savings */}
      <View className="bg-gray-900 rounded-xl p-5 mb-5">
        <View className="bg-green-200/10 w-16 h-16 rounded-full items-center justify-center mx-auto mb-4">
          <DollarSign color="#10B981" size={32} />
        </View>
        <Text className="text-4xl font-bold mb-1 text-green-400 text-center">
          {fmt(totalSavings)}
        </Text>
        <Text className="text-center text-gray-400 mb-2 text-lg">Total Savings</Text>
        <View className="flex-row justify-center items-center">
          <TrendingUp color="#4ade80" size={16} />
          <Text className="text-main ml-1 text-xl">Great progress!</Text>
        </View>
      </View>

      {/* Monthly Savings — bar chart (keeps cents in labels) */}
      <View className="bg-gray-900 rounded-xl p-5 mb-5">
        <Text className="text-xl font-bold text-white mb-3">Monthly Savings</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator className="w-full">
          <View className="flex-row items-end py-2">
            {bars.map(({ key, value }) => {
              const h = Math.max(2, (value / maxValue) * 140);
              return (
                <View key={key} className="items-center mx-2">
                  <View className="bg-green-500 rounded-t-lg" style={{ width: 18, height: h }} />
                  <Text className="text-gray-300 text-xs mt-1">{monthLabel(key)}</Text>
                  <Text className="text-green-400 text-[10px] mt-0.5">
                    {fmt(value)} {/* ← now always shows cents */}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Monthly list (same data, also uses cents) */}
      <View className="bg-gray-900 rounded-xl p-5">
        <Text className="text-xl font-bold text-white mb-3">Savings History (Monthly)</Text>
        <View>
          {bars.map(({ key, value }) => {
            const pct = Math.max(0.03, value / maxValue);
            return (
              <View key={key} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-300">{monthLabel(key)}</Text>
                  <Text className="text-green-400 font-semibold">{fmt(value)}</Text>
                </View>
                <View className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                  <View style={{ width: `${pct * 100}%` }} className="h-full bg-green-500 rounded-full" />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
