// app/(tabs)/savings.tsx
import { DollarSign, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
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

function monthLabelShortFromIndex(i: number) {
  const names = ['J','F','M','A','M','J','J','A','S','O','N','D']; // Apple-style compact
  return names[i] ?? '';
}

function monthLabelLong(key: string) {
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
    const arr = Array.from(set).sort((a, b) => b - a);
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr;
  }, [trips]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const [yearOpen, setYearOpen] = useState(false);

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

    const maxV = Math.max(1, ...arr.map((b) => b.value));
    const total = arr.reduce((sum, b) => sum + b.value, 0);

    return { bars: arr, maxValue: maxV, yearTotal: total };
  }, [trips, selectedYear]);

  // Apple Health style: tap bar to show detail
  const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null);

  // Keep selection valid when year changes
  useEffect(() => {
    setSelectedBarKey(null);
  }, [selectedYear]);

  const selectedBar = useMemo(() => {
    if (!selectedBarKey) return null;
    return bars.find((b) => b.key === selectedBarKey) ?? null;
  }, [bars, selectedBarKey]);

  if (loading && (trips as any[]).length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  // Chart sizing (Apple Health vibes)
  const CHART_H = 160;
  const BAR_W = 12;          // slim bars
  const BAR_GAP = 10;        // spacing between bars
  const MIN_BAR_H = 3;       // make tiny values visible
  const TOP_PAD = 10;

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

      {/* Savings History card */}
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

        {/* Selected month readout (Apple Health style) */}
        <View className="mb-3">
          <Text className="text-gray-400 font-semibold">
            {selectedBar
              ? `${monthLabelLong(selectedBar.key)} ${selectedYear}`
              : `Tap a month`}
          </Text>
          <Text className="text-white text-2xl font-bold">
            {selectedBar ? fmt(selectedBar.value) : fmt(yearTotal)}
          </Text>
          {!selectedBar && (
            <Text className="text-gray-500">Showing {selectedYear} total</Text>
          )}
        </View>

        {/* Vertical bar chart */}
        <View className="bg-gray-950/40 rounded-2xl p-4">
          {/* Chart area */}
          <View style={{ height: CHART_H + TOP_PAD }} className="justify-end">
            {/* baseline */}
            <View className="absolute left-0 right-0 bottom-0 h-[1px] bg-gray-700/70" />

            <View className="flex-row items-end justify-between">
              {bars.map(({ key, value }, idx) => {
                const raw = value / maxValue;
                const h =
                  value === 0 ? 0 : Math.max(MIN_BAR_H, Math.round(raw * CHART_H));

                const active = selectedBarKey === key;

                return (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedBarKey((prev) => (prev === key ? null : key))}
                    style={{ width: BAR_W + BAR_GAP, alignItems: 'center' }}
                  >
                    {/* bar */}
                    <View
                      className={[
                        'rounded-full',
                        active ? 'bg-green-400' : 'bg-green-500',
                      ].join(' ')}
                      style={{
                        width: BAR_W,
                        height: h,
                        opacity: value === 0 ? 0.35 : 1,
                      }}
                    />

                    {/* tiny non-zero indicator dot (super minimal) */}
                    {value > 0 && (
                      <View
                        className="bg-green-200/35 rounded-full mt-1"
                        style={{ width: 2, height: 2 }}
                      />
                    )}

                    {/* month label */}
                    <Text className="text-gray-500 mt-2 text-xs">
                      {monthLabelShortFromIndex(idx)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Year total at bottom */}
        <View className="mt-4 pt-3 border-t border-gray-800 flex-row justify-between">
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
