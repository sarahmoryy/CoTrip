import { DollarSign, TrendingUp } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Card } from "../../components/ui/primitives";
import { C, FONT } from "../../components/ui/theme";
import {
  selectTotalSavingsFromTrips,
  selectTrips,
  Trip,
} from "../../store/tripSlice";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});
const fmt = (v: number) => currency.format(Number(v || 0));

function monthKeyFromDateStr(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_SHORT = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];
const MONTH_LONG = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function SavingsScreen() {
  const trips = useSelector(selectTrips);
  const totalSavings = useSelector(selectTotalSavingsFromTrips);
  const loading = useSelector((s: any) => s.trip?.loading) ?? false;

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const t of trips as Trip[]) {
      const key = monthKeyFromDateStr(t.date);
      if (key) set.add(Number(key.split("-")[0]));
    }
    const arr = Array.from(set).sort((a, b) => b - a);
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr;
  }, [trips]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const [yearOpen, setYearOpen] = useState(false);
  const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null);

  useEffect(() => {
    if (!availableYears.includes(selectedYear))
      setSelectedYear(availableYears[0]);
  }, [availableYears]);
  useEffect(() => {
    setSelectedBarKey(null);
  }, [selectedYear]);

  const { bars, maxValue, yearTotal } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of trips as Trip[]) {
      const key = monthKeyFromDateStr(t.date);
      if (!key) continue;
      if (Number(key.split("-")[0]) !== selectedYear) continue;
      totals.set(key, (totals.get(key) ?? 0) + Number(t.savings ?? 0));
    }
    const arr = Array.from({ length: 12 }, (_, i) => {
      const k = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
      return { key: k, value: Number(totals.get(k) ?? 0) };
    });
    return {
      bars: arr,
      maxValue: Math.max(1, ...arr.map((b) => b.value)),
      yearTotal: arr.reduce((s, b) => s + b.value, 0),
    };
  }, [trips, selectedYear]);

  const selectedBar = useMemo(
    () => bars.find((b) => b.key === selectedBarKey) ?? null,
    [bars, selectedBarKey],
  );

  if (loading && (trips as any[]).length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  const CHART_H = 140;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: 64, paddingBottom: 24 }}>
        <Text style={FONT.pageTitle}>Savings</Text>
        <Text style={[FONT.bodyMuted, { marginTop: 4 }]}>
          Calculated from your trips
        </Text>
      </View>

      {/* All-time total */}
      <Card style={{ padding: 24, alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 52,
            height: 52,
            backgroundColor: C.greenTint,
            borderRadius: 26,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <DollarSign color={C.green} size={24} />
        </View>
        <Text
          style={{
            color: C.green,
            fontSize: 36,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          {fmt(totalSavings)}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
          All-time savings
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <TrendingUp color={C.green} size={14} />
          <Text style={{ color: C.green, fontSize: 13, marginLeft: 5 }}>
            Great progress!
          </Text>
        </View>
      </Card>

      {/* Chart card */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        {/* Title row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={FONT.sectionTitle}>Savings history</Text>
          <TouchableOpacity
            onPress={() => setYearOpen(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: C.surfaceAlt,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              gap: 6,
            }}
          >
            <Text
              style={{ color: C.textPrimary, fontSize: 13, fontWeight: "600" }}
            >
              {selectedYear}
            </Text>
            <Text style={{ color: C.textMuted, fontSize: 10 }}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Selected readout */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 2 }}>
            {selectedBar
              ? `${MONTH_LONG[Number(selectedBar.key.split("-")[1]) - 1]} ${selectedYear}`
              : `${selectedYear} total`}
          </Text>
          <Text
            style={{ color: C.textPrimary, fontSize: 28, fontWeight: "700" }}
          >
            {selectedBar ? fmt(selectedBar.value) : fmt(yearTotal)}
          </Text>
        </View>

        {/* Bar chart */}
        <View style={{ height: CHART_H + 24 }}>
          <View
            style={{
              position: "absolute",
              bottom: 24,
              left: 0,
              right: 0,
              height: 0.5,
              backgroundColor: C.borderMid,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              height: CHART_H,
              paddingBottom: 0,
            }}
          >
            {bars.map(({ key, value }, idx) => {
              const h =
                value === 0
                  ? 2
                  : Math.max(4, Math.round((value / maxValue) * CHART_H));
              const active = selectedBarKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() =>
                    setSelectedBarKey((p) => (p === key ? null : key))
                  }
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: CHART_H,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: h,
                      backgroundColor: active
                        ? C.green
                        : value === 0
                          ? C.borderMid
                          : "#1a5c35",
                      borderRadius: 4,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
          {/* Month labels */}
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            {bars.map(({ key }, idx) => (
              <View key={key} style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    color: selectedBarKey === key ? C.green : C.textMuted,
                    fontSize: 10,
                    fontWeight: selectedBarKey === key ? "700" : "400",
                  }}
                >
                  {MONTH_SHORT[idx]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Year total footer */}
        <View
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 0.5,
            borderTopColor: C.border,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: C.textMuted, fontSize: 13 }}>
            {selectedYear} total
          </Text>
          <Text style={{ color: C.green, fontSize: 13, fontWeight: "700" }}>
            {fmt(yearTotal)}
          </Text>
        </View>
      </Card>

      {/* Year picker modal */}
      <Modal
        visible={yearOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setYearOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
          onPress={() => setYearOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: C.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 0.5,
              borderColor: C.border,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[FONT.sectionTitle, { marginBottom: 16 }]}>
              Select year
            </Text>
            {availableYears.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  setSelectedYear(y);
                  setYearOpen(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  marginBottom: 6,
                  backgroundColor:
                    y === selectedYear ? C.greenDark : C.surfaceAlt,
                }}
              >
                <Text
                  style={{
                    color: y === selectedYear ? "#fff" : C.textPrimary,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setYearOpen(false)}
              style={{ paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: C.textMuted, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
