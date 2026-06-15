import { toMillis } from "@/assets/utils/conversion";
import {
  endOfMonth,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../components/ui/theme";
import { TripService, UserService } from "../../store/all";
import { RootState } from "../../store/store";
import { setTrips } from "../../store/tripSlice";
import { UserState } from "../../store/userSlice";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const toNumber = (n: any) =>
  typeof n === "number" ? n : typeof n === "string" ? Number(n) || 0 : 0;
const parseTripDate = (input: any): Date => {
  if (!input) return new Date(0);
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);
  if (typeof input === "string") return new Date(input);
  if (typeof input === "object" && "seconds" in input)
    return new Date(input.seconds * 1000);
  return new Date(0);
};

type MockFolder = {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  memberCount: number;
  postCount: number;
};

// Backend wires up next — pure UI scaffolding for now.
const MOCK_FOLDERS: MockFolder[] = [
  {
    id: "mcgill",
    name: "McGill",
    emoji: "🎓",
    accent: "#ef4444",
    memberCount: 6,
    postCount: 12,
  },
  {
    id: "family",
    name: "Family",
    emoji: "👨‍👩‍👧",
    accent: "#f59e0b",
    memberCount: 4,
    postCount: 8,
  },
  {
    id: "roommates",
    name: "Roommates",
    emoji: "🏠",
    accent: "#8b5cf6",
    memberCount: 3,
    postCount: 5,
  },
  {
    id: "ski-crew",
    name: "Ski crew",
    emoji: "🎿",
    accent: "#0ea5e9",
    memberCount: 5,
    postCount: 2,
  },
];

export default function HomeScreen() {
  const { C, FONT } = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const trips = useSelector((s: RootState) => s.trip.trips);
  const [user, setUser] = useState<UserState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [userData, tripsData] = await Promise.all([
        UserService.me(),
        TripService.list("-created_date", 50),
      ]);
      setUser(userData);
      if (tripsData)
        dispatch(
          setTrips(
            tripsData.map((t: any) => ({
              ...t,
              date: toMillis(t.date),
              createdAt: toMillis(t.createdAt),
              updatedAt: toMillis(t.updatedAt),
              savings: toNumber(t.savings),
            })),
          ),
        );
    } finally {
      setRefreshing(false);
      setBootLoading(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const tripsThisMonth = useMemo(
    () =>
      trips.filter((t) =>
        isWithinInterval(parseTripDate(t.date), {
          start: monthStart,
          end: monthEnd,
        }),
      ),
    [trips],
  );
  const monthlySavings = useMemo(
    () => tripsThisMonth.reduce((sum, t) => sum + toNumber(t.savings), 0),
    [tripsThisMonth],
  );

  if (bootLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator size="large" color={C.textPrimary} />
      </View>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "";

  const handleNewFolder = () => {
    Alert.alert(
      "New folder",
      "Folder creation wires up with the backend next. For now this is the UI scaffold.",
    );
  };

  const openFolder = (folder: MockFolder) => {
    router.push({
      pathname: "/folder/[id]",
      params: {
        id: folder.id,
        name: folder.name,
        emoji: folder.emoji,
        accent: folder.accent,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 64,
          paddingBottom: 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAll}
            tintColor={C.textPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header — Uber-style large bold greeting */}
        <View style={{ paddingBottom: 28 }}>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 13,
              fontWeight: "600",
              letterSpacing: 0.2,
            }}
          >
            Welcome back
          </Text>
          <Text style={[FONT.pageTitle, { marginTop: 4 }]}>
            {firstName || "Driver"} 👋
          </Text>
        </View>

        {/* Savings card — prominent rounded box, clearly tappable */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/trips")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.surface,
            borderRadius: C.radiusLg,
            paddingVertical: 18,
            paddingHorizontal: 18,
            marginBottom: 32,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: C.textMuted,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Saved this month
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                marginTop: 4,
              }}
            >
              <Text style={FONT.stat}>
                {currency.format(monthlySavings)}
              </Text>
              <Text
                style={{
                  color: C.textMuted,
                  fontSize: 13,
                  marginLeft: 8,
                  fontWeight: "500",
                }}
              >
                {tripsThisMonth.length} trip
                {tripsThisMonth.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
          <ChevronRight color={C.textMuted} size={20} />
        </TouchableOpacity>

        {/* Folders section header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text style={FONT.sectionTitle}>Folders</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNewFolder}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: 4,
            }}
          >
            <Plus color={C.textPrimary} size={14} />
            <Text
              style={{
                color: C.textPrimary,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            rowGap: 12,
          }}
        >
          {MOCK_FOLDERS.map((f) => (
            <FolderTile key={f.id} folder={f} onPress={() => openFolder(f)} />
          ))}
          <NewFolderTile onPress={handleNewFolder} />
        </View>
      </ScrollView>
    </View>
  );
}

function FolderTile({
  folder,
  onPress,
}: {
  folder: MockFolder;
  onPress: () => void;
}) {
  const { C } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        width: "48.5%",
        backgroundColor: C.surface,
        borderRadius: C.radiusLg,
        padding: 16,
        minHeight: 140,
        justifyContent: "space-between",
      }}
    >
      {/* Top row: icon chip + chevron */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: folder.accent + "1F",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>{folder.emoji}</Text>
        </View>
        <ChevronRight color={C.textMuted} size={16} />
      </View>

      {/* Bottom: name + meta */}
      <View style={{ marginTop: 24 }}>
        <Text
          style={{
            color: C.textPrimary,
            fontSize: 16,
            fontWeight: "700",
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
        >
          {folder.name}
        </Text>
        <Text
          style={{
            color: C.textMuted,
            fontSize: 12,
            marginTop: 4,
            fontWeight: "500",
          }}
        >
          {folder.memberCount} members · {folder.postCount} posts
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function NewFolderTile({ onPress }: { onPress: () => void }) {
  const { C } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        width: "48.5%",
        minHeight: 140,
        borderRadius: C.radiusLg,
        borderWidth: 1,
        borderColor: C.borderMid,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: C.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus color={C.textPrimary} size={18} />
      </View>
      <Text
        style={{
          color: C.textSecondary,
          fontSize: 13,
          fontWeight: "600",
          marginTop: 10,
        }}
      >
        New folder
      </Text>
    </TouchableOpacity>
  );
}
