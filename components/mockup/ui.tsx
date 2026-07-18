import {
  Bell,
  Car,
  ChevronRight,
  MapPin,
  Menu,
  MoreVertical,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users,
  X,
} from "lucide-react-native";
import React, { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "./AppContext";
import { MGroup, MRequestStatus, MRide, MUser } from "./data";
import { M, RADIUS } from "./theme";

// ---- MockScreen wrapper with top header ----
export function MockScreen({ children }: { children: ReactNode }) {
  const { unreadNotificationsCount, openNotifications } = useApp();
  const headerBellCount = Math.min(unreadNotificationsCount, 9);
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: M.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: M.bg,
        }}
      >
        <Menu color={M.amber500} size={26} />
        <Text style={{ fontSize: 12, fontWeight: "600", color: M.stone500 }}>CoTrip</Text>
        <TouchableOpacity onPress={openNotifications} hitSlop={8}>
          <Bell color={M.amber500} size={26} />
          {headerBellCount > 0 ? (
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: M.amber500,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: M.white, fontWeight: "900", fontSize: 10 }}>{headerBellCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: M.bg }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Btn ----
export function Btn({
  onPress,
  children,
  style,
  variant = "primary",
  disabled,
}: {
  onPress?: () => void;
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "primary" | "secondary" | "dark" | "muted" | "ghost";
  disabled?: boolean;
}) {
  const base: ViewStyle = {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  };
  const palette = {
    primary: { bg: M.amber400, fg: M.white },
    secondary: { bg: M.amber100, fg: M.amber600 },
    dark: { bg: M.stone900, fg: M.white },
    muted: { bg: M.stone100, fg: M.stone600 },
    ghost: { bg: "transparent", fg: M.amber500 },
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        base,
        {
          backgroundColor: disabled ? M.stone100 : palette.bg,
          shadowColor: variant === "primary" ? M.amber200 : "transparent",
          shadowOpacity: variant === "primary" ? 0.6 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        style as ViewStyle,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={{ color: disabled ? M.stone400 : palette.fg, fontWeight: "900", fontSize: 14 }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

// ---- ShellCard ----
export function ShellCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View
      style={[
        {
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: M.stone100,
          backgroundColor: M.surface,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

// ---- RoundIcon ----
export function RoundIcon({ children, size = 54 }: { children: ReactNode; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: M.amber400,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: M.amber200,
        shadowOpacity: 0.8,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

// ---- AvatarStack ----
export function AvatarStack({ members }: { members: MUser[] }) {
  const visible = members.slice(0, 3);
  const extra = Math.max(members.length - visible.length, 0);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {visible.map((m, i) => (
        <Image
          key={m.id}
          source={{ uri: m.avatar }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: M.white,
            marginLeft: i === 0 ? 0 : -8,
          }}
        />
      ))}
      {extra > 0 ? (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: M.white,
            backgroundColor: M.stone100,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: M.stone700 }}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---- OrderedAvatarRow ----
export function OrderedAvatarRow({ people = [] }: { people: MUser[] }) {
  const visible = people.slice(0, 6);
  const extra = Math.max(people.length - visible.length, 0);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {visible.map((p, i) => (
        <Image
          key={p.id || `${p.name}-${i}`}
          source={{ uri: p.avatar }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: M.white,
            marginLeft: i === 0 ? 0 : -8,
          }}
        />
      ))}
      {extra > 0 ? (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: M.white,
            backgroundColor: M.stone100,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -8,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "900", color: M.stone700 }}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---- RatingBadge ----
export function RatingBadge({
  rating,
  reviewCount,
  ridesCompleted,
  label,
  compact = false,
}: {
  rating?: number;
  reviewCount?: number;
  ridesCompleted?: number;
  label?: string;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: M.amber50,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      {label ? (
        <Text style={{ color: M.stone500, fontWeight: "600", fontSize: compact ? 11 : 13 }}>{label}</Text>
      ) : null}
      <Star size={compact ? 12 : 14} color={M.amber400} fill={M.amber400} />
      <Text style={{ color: M.amber600, fontWeight: "900", fontSize: compact ? 11 : 13 }}>
        {rating?.toFixed ? rating.toFixed(1) : "New"}
      </Text>
      {reviewCount ? (
        <Text style={{ color: M.stone400, fontWeight: "600", fontSize: compact ? 11 : 13 }}>
          ({reviewCount})
        </Text>
      ) : null}
      {ridesCompleted ? (
        <Text style={{ color: M.stone500, fontWeight: "600", fontSize: compact ? 11 : 13 }}>
          {`· ${ridesCompleted} rides`}
        </Text>
      ) : null}
    </View>
  );
}

// ---- StatusPill ----
export function StatusPill({ status }: { status: MRequestStatus }) {
  const style: Record<MRequestStatus, { bg: string; fg: string }> = {
    pending: { bg: M.amber50, fg: M.amber700 },
    approved: { bg: M.emerald50, fg: M.emerald700 },
    declined: { bg: M.red50, fg: M.red600 },
    cancelled: { bg: M.stone100, fg: M.stone500 },
    completed: { bg: M.blue50, fg: M.blue700 },
  };
  const label: Record<MRequestStatus, string> = {
    pending: "Pending Driver Approval",
    approved: "Approved",
    declined: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  const p = style[status] || style.pending;
  return (
    <View style={{ backgroundColor: p.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: p.fg, fontWeight: "900", fontSize: 11 }}>{label[status]}</Text>
    </View>
  );
}

// ---- SectionHeader ----
export function SectionHeader({
  icon,
  title,
  onSeeAll,
}: {
  icon?: ReactNode;
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {icon ? <View>{icon}</View> : null}
        <Text style={{ fontSize: 20, fontWeight: "900", color: M.stone950 }}>{title}</Text>
      </View>
      {onSeeAll ? (
        <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: M.amber500 }}>See All</Text>
          <ChevronRight color={M.amber500} size={18} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---- DisclaimerCard ----
export function DisclaimerCard() {
  return (
    <View
      style={{
        borderRadius: RADIUS.md,
        backgroundColor: M.amber50,
        padding: 14,
        borderWidth: 1,
        borderColor: M.amber100,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <ShieldCheck size={16} color={M.amber500} />
        <Text style={{ color: M.stone800, fontWeight: "900", fontSize: 13 }}>Ride Disclaimer</Text>
      </View>
      <Text style={{ color: M.stone600, fontSize: 12, lineHeight: 17 }}>
        CoTrip helps trusted contacts coordinate shared rides and cost splitting. A ride is not
        confirmed until the driver accepts the request.
      </Text>
    </View>
  );
}

// ---- DriverChip ----
export function DriverChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: M.amber50,
        paddingLeft: 12,
        paddingRight: onRemove ? 4 : 12,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: M.amber700, fontWeight: "900", fontSize: 12 }}>{label}</Text>
      {onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          style={{ padding: 4, borderRadius: 999 }}
          hitSlop={6}
        >
          <X color={M.amber700} size={14} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---- DriverStars ----
export function DriverStars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Star
            size={32}
            color={n <= value ? M.amber400 : M.stone300}
            fill={n <= value ? M.amber400 : "transparent"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---- Sheet (modal) ----
export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, backgroundColor: M.overlay, justifyContent: "flex-end" }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <View
            style={{
              backgroundColor: M.surface,
              borderTopLeftRadius: RADIUS.xl,
              borderTopRightRadius: RADIUS.xl,
              maxHeight: "85%",
              paddingBottom: 24,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: -6 },
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "900", color: M.stone950 }}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10} style={{ padding: 8, borderRadius: 999 }}>
                <X color={M.stone500} size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---- QuickMessageButtons ----
export function QuickMessageButtons({ onMessage }: { onMessage: (m: string) => void }) {
  const messages = ["I'm outside", "Running 5 minutes late", "Where should I meet you?"];
  return (
    <View style={{ gap: 8 }}>
      {messages.map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => onMessage(m)}
          style={{ backgroundColor: M.amber50, paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md }}
        >
          <Text style={{ color: M.amber700, fontWeight: "700", fontSize: 13 }}>{m}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---- ReviewBox ----
export function ReviewBox({
  reviewRating,
  reviewComment,
  onRatingChange,
  onCommentChange,
  onSubmit,
}: {
  reviewRating: number;
  reviewComment: string;
  onRatingChange: (n: number) => void;
  onCommentChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <ShellCard>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontWeight: "900", color: M.stone950 }}>Rate your driver</Text>
        <DriverStars value={reviewRating} onChange={onRatingChange} />
        <TextInput
          multiline
          value={reviewComment}
          onChangeText={onCommentChange}
          placeholder="Optional comment"
          placeholderTextColor={M.stone400}
          style={textInputStyle({ minHeight: 80 })}
        />
        <Btn onPress={onSubmit}>Submit Review</Btn>
      </View>
    </ShellCard>
  );
}

// ---- TextInput style helper ----
export function textInputStyle(extra?: TextStyle): TextStyle {
  return {
    backgroundColor: M.amber50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: M.amber100,
    fontSize: 14,
    color: M.stone800,
    ...extra,
  };
}

// ---- GroupCard ----
export function GroupCard({
  group,
  members,
  onOpen,
  onJoinGroup,
}: {
  group: MGroup;
  members: MUser[];
  onOpen: () => void;
  onJoinGroup: (id: string) => void;
}) {
  const driverRating =
    members.reduce((s, m) => s + (m.driverRating || 0), 0) / Math.max(members.length, 1);
  const reviewCount = members.reduce((s, m) => s + (m.driverReviewCount || 0), 0);
  const ridesCompleted = members.reduce((s, m) => s + (m.driverRidesCompleted || 0), 0);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onOpen}>
      <ShellCard>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
          <RoundIcon>
            <Users color={M.white} size={28} />
          </RoundIcon>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>
              {group.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <AvatarStack members={members} />
              <RatingBadge
                label="Drivers"
                rating={driverRating}
                reviewCount={reviewCount}
                ridesCompleted={ridesCompleted}
                compact
              />
            </View>
          </View>

          <View style={{ borderLeftWidth: 1, borderLeftColor: M.stone200, paddingLeft: 12, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: M.amber500 }}>
              ${group.saved.toFixed(2)}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 11, fontWeight: "600", color: M.stone500 }}>saved</Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onJoinGroup(group.id);
              }}
              style={{
                backgroundColor: M.amber100,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: M.amber600, fontWeight: "900", fontSize: 11 }}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => e.stopPropagation?.()}
              style={{ padding: 4 }}
              hitSlop={6}
            >
              <MoreVertical color={M.amber500} size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </ShellCard>
    </TouchableOpacity>
  );
}

// ---- RideCard ----
export function RideCard({
  ride,
  onOpenJoin,
  driver,
}: {
  ride: MRide;
  onOpenJoin: (r: MRide) => void;
  driver: MUser | null;
}) {
  return (
    <ShellCard>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
        <RoundIcon>
          <Car color={M.white} size={28} />
        </RoundIcon>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>
            {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: M.stone500 }}>
            {ride.date}, {ride.departureTime} · {ride.duration}
          </Text>

          {driver ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: M.stone500 }}>
                Driver: {driver.name}
              </Text>
              <RatingBadge
                label="Driver"
                rating={driver.driverRating}
                reviewCount={driver.driverReviewCount}
                ridesCompleted={driver.driverRidesCompleted}
                compact
              />
            </View>
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <UserIcon color={M.stone800} size={14} />
              <Text style={{ color: M.stone800, fontWeight: "500", fontSize: 13 }}>
                {ride.seatsLeft} {ride.seatsLeft === 1 ? "seat" : "seats"}
              </Text>
            </View>
            <Text style={{ color: M.stone500 }}>·</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin color={M.stone800} size={14} />
              <Text style={{ color: M.stone800, fontWeight: "500", fontSize: 13 }}>{ride.distance}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onOpenJoin(ride)}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          hitSlop={8}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: M.amber500 }}>Join</Text>
          <ChevronRight color={M.amber500} size={22} />
        </TouchableOpacity>
      </View>
    </ShellCard>
  );
}

export const styles = StyleSheet.create({});
