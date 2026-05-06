// components/ui/primitives.tsx
import React from "react";
import {
    Platform,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from "react-native";
import { C, FONT } from "./theme";

// ─── Field Label ─────────────────────────────────────────────────────────────
export function FieldLabel({
  text,
  style,
}: {
  text: string;
  style?: TextStyle;
}) {
  return <Text style={[FONT.label, { marginBottom: 6 }, style]}>{text}</Text>;
}

// ─── Section Card ─────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: C.surface,
          borderRadius: C.radiusLg,
          borderWidth: 0.5,
          borderColor: C.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
interface BtnProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "outline" | "danger";
}
export function Btn({
  label,
  loading,
  disabled,
  variant = "primary",
  style,
  ...rest
}: BtnProps) {
  const bg =
    disabled || loading
      ? C.surfaceAlt
      : variant === "primary"
        ? C.greenDark
        : variant === "danger"
          ? C.redDim
          : "transparent";

  const textColor =
    disabled || loading
      ? C.textDisabled
      : variant === "primary"
        ? "#fff"
        : variant === "danger"
          ? C.red
          : C.green;

  const borderColor =
    variant === "outline"
      ? C.green
      : variant === "danger"
        ? C.red
        : "transparent";

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          height: 52,
          borderRadius: C.radius,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          borderWidth: variant !== "primary" ? 1 : 0,
          borderColor,
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 15,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        {loading ? "Loading..." : label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Input Field wrapper ──────────────────────────────────────────────────────
export function InputBox({
  children,
  focused,
  style,
}: {
  children: React.ReactNode;
  focused?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: C.surfaceAlt,
          borderWidth: 1,
          borderColor: focused ? C.borderFocus : C.borderMid,
          borderRadius: C.radius,
          minHeight: 52,
          paddingHorizontal: 12,
          justifyContent: "center",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View
      style={{ paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 20 }}
    >
      <Text style={FONT.pageTitle}>{title}</Text>
      {subtitle && (
        <Text style={[FONT.bodyMuted, { marginTop: 4 }]}>{subtitle}</Text>
      )}
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: C.radiusLg,
        borderWidth: 0.5,
        borderColor: C.border,
        padding: 40,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          backgroundColor: C.greenTint,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </View>
      <Text
        style={[FONT.sectionTitle, { marginBottom: 8, textAlign: "center" }]}
      >
        {title}
      </Text>
      <Text
        style={[
          FONT.bodyMuted,
          { textAlign: "center", lineHeight: 20, marginBottom: 24 },
        ]}
      >
        {subtitle}
      </Text>
      {action && onAction && (
        <Btn
          label={action}
          onPress={onAction}
          style={{ paddingHorizontal: 32, height: 44 }}
        />
      )}
    </View>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────
export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: C.radiusXl,
        padding: 24,
        width: "100%",
        maxWidth: 440,
        borderWidth: 0.5,
        borderColor: C.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={FONT.pageTitle}>{title}</Text>
          {subtitle && (
            <Text style={[FONT.bodyMuted, { marginTop: 3 }]}>{subtitle}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            backgroundColor: C.surfaceAlt,
            borderRadius: 20,
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: C.textSecondary, fontSize: 14 }}>✕</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}
