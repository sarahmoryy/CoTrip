// app/(tabs)/savings.tsx
import { DollarSign, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectTotalSavingsFromTrips, selectTrips, Trip } from '../../store/tripSlice';

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

function monthLabelShort(key: string): string {
  // key = "YYYY-MM"
  const [, mStr] = key.split('-');
  const m = Number(mStr);
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[(m || 1) - 1] ?? 'Jan';
}

function monthKey(year: number, month1to12: number) {
  return `${year}-${String(month1to12).padStart(2, '0')}`;
}

export default function SavingsScreen() {
  const trips = useSelector(selectTrips);
  const totalSavings = useSelector(selectTotalSavingsFromTrips);
  const loading = useSelector((s: any) => s.trip?.loading) ?? false;

  // Available years from trips
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const t of trips as Trip[]) {
      const key = monthKeyFromDateStr(t.date);
      if (!key) continue;
      set.add(Number(key.split('-')[0]));
    }
    const arr = Array.from(set).sort((a, b) => b - a); // newest first
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr;
  }, [trips]);

  // Selected year (default to newest year)
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const [yearOpen, setYearOpen] = useState(false);

  // Keep selectedYear valid if trips load later
  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Bars (Jan–Dec) + year total for selected year
  const { bars, maxValue, yearTotal } = useMemo(() => {
    const totals = new Map<string, number>();

    for (const t of trips as Trip[]) {
      const key = monthKeyFromDateStr(t.date);
      if (!key) continue;

      const [yStr] = key.split('-');
      const y = Number(yStr);
      if (y !== selectedYear) continue;

      const val = Number(t.savings ?? 0);
      totals.set(key, (totals.get(key) ?? 0) + val);
    }

    const arr = Array.from({ length: 12 }, (_, i) => {
      const k = monthKey(selectedYear, i + 1);
      return { key: k, value: Number(totals.get(k) ?? 0) };
    });

    const maxV = Math.max(1, ...arr.map(b => b.value));
    const total = arr.reduce((sum, b) => sum + b.value, 0);

    return { bars: arr, maxValue: maxV, yearTotal: total };
  }, [trips, selectedYear]);

  if (loading && (trips as any[]).length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
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

      {/* Total Savings (all-time) */}
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

      {/* Savings History card (small dropdown inside same component) */}
      <View className="bg-gray-900 rounded-xl p-5">
        {/* Title row + small dropdown */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-white">Savings History</Text>

          <Pressable
            onPress={() => setYearOpen(true)}
            className="bg-gray-800 rounded-lg px-3 py-2 flex-row items-center"
          >
            <Text className="text-white font-semibold mr-2">{selectedYear}</Text>
            <Text className="text-gray-400">▼</Text>
          </Pressable>
        </View>

        {/* Bars */}
        <View>
          {bars.map(({ key, value }) => {
            const pct = Math.max(0.03, value / maxValue);
            return (
              <View key={key} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-300">{monthLabelShort(key)}</Text>
                  <Text className="text-green-400 font-semibold">{fmt(value)}</Text>
                </View>

                <View className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${pct * 100}%` }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Year total at bottom (inside same component) */}
        <View className="mt-2 pt-3 border-t border-gray-800 flex-row justify-between">
          <Text className="text-gray-400 font-semibold">{selectedYear} total</Text>
          <Text className="text-green-400 font-bold">{fmt(yearTotal)}</Text>
        </View>

        {/* Dropdown modal */}
        <Modal
          visible={yearOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setYearOpen(false)}
        >
          <Pressable
            className="flex-1 bg-black/60 justify-center px-8"
            onPress={() => setYearOpen(false)}
          >
            <Pressable
              className="bg-gray-900 rounded-2xl p-4"
              onPress={(e) => e.stopPropagation()}
            >
              <Text className="text-white font-bold text-lg mb-3">Select year</Text>

              {availableYears.map((y) => {
                const active = y === selectedYear;
                return (
                  <Pressable
                    key={y}
                    onPress={() => {
                      setSelectedYear(y);
                      setYearOpen(false);
                    }}
                    className={[
                      'px-4 py-3 rounded-xl mb-2',
                      active ? 'bg-green-500' : 'bg-gray-800',
                    ].join(' ')}
                  >
                    <Text className={active ? 'text-black font-bold' : 'text-white font-semibold'}>
                      {y}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => setYearOpen(false)}
                className="mt-1 px-4 py-3 rounded-xl bg-gray-800"
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </ScrollView>
  );
}
