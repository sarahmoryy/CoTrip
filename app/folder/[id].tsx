import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Send, UserPlus, Users } from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../components/ui/theme";

export default function FolderDetailScreen() {
  const { C, FONT } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    emoji?: string;
    accent?: string;
  }>();

  const name = params.name || "Folder";
  const emoji = params.emoji || "📁";
  const accent = params.accent || C.green;

  const notImplemented = (label: string) =>
    Alert.alert(
      label,
      "Wires up with the backend next. This screen is a UI scaffold.",
    );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 64,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: C.surface,
              borderWidth: 0.5,
              borderColor: C.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft color={C.textPrimary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Folder hero */}
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: accent + "22",
              borderWidth: 0.5,
              borderColor: accent + "55",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 34 }}>{emoji}</Text>
          </View>
          <Text style={FONT.pageTitle}>{name}</Text>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Shared trips with this group
          </Text>
        </View>

        {/* Action row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => notImplemented("Post a trip")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              backgroundColor: C.primary,
              borderRadius: C.radius,
              gap: 8,
            }}
          >
            <Send color={C.primaryText} size={16} />
            <Text
              style={{
                color: C.primaryText,
                fontSize: 14,
                fontWeight: "700",
                letterSpacing: -0.1,
              }}
            >
              Post a trip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => notImplemented("Invite people")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              backgroundColor: C.surface,
              borderRadius: C.radius,
              gap: 8,
            }}
          >
            <UserPlus color={C.textPrimary} size={16} />
            <Text
              style={{
                color: C.textPrimary,
                fontSize: 14,
                fontWeight: "700",
                letterSpacing: -0.1,
              }}
            >
              Invite
            </Text>
          </TouchableOpacity>
        </View>

        {/* Members preview */}
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: C.border,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Users color={C.green} size={18} />
          <Text
            style={{
              color: C.textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginLeft: 10,
              flex: 1,
            }}
          >
            Members
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>
            Coming soon
          </Text>
        </View>

        {/* Feed placeholder */}
        <Text
          style={[
            FONT.sectionTitle,
            { marginBottom: 12, fontSize: 16 },
          ]}
        >
          Feed
        </Text>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: C.border,
            padding: 24,
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.textMuted, fontSize: 14, textAlign: "center" }}>
            Posted trips will show here once the backend is wired up.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
