import { useRouter } from "expo-router";
import { Lock, Mail, User as UserIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Btn } from "../components/ui/primitives";
import { C } from "../components/ui/theme";
import { UserService } from "../store/all";

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  secure,
  keyboard,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: C.textMuted,
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.7,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.surfaceAlt,
          borderWidth: 1,
          borderColor: focused ? C.borderFocus : C.borderMid,
          borderRadius: C.radius,
          height: 52,
          paddingHorizontal: 12,
        }}
      >
        {icon &&
          React.cloneElement(icon, {
            color: focused ? C.green : C.textMuted,
            size: 16,
            style: { marginRight: 10 },
          })}
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          secureTextEntry={secure}
          keyboardType={keyboard}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={secure ? "oneTimeCode" : undefined}
          style={{
            flex: 1,
            color: C.textPrimary,
            fontSize: 15,
            paddingVertical: 0,
          }}
        />
      </View>
    </View>
  );
}

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (k: string) => (v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await UserService.signup(
        formData.full_name,
        formData.email,
        formData.password,
        formData.confirmPassword,
      );
      Alert.alert("Success", "Account created! Please log in.");
      router.push("/login");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <View
            style={{
              width: 72,
              height: 72,
              backgroundColor: C.greenTint,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0.5,
              borderColor: "rgba(74,222,128,0.25)",
              marginBottom: 16,
            }}
          >
            <UserIcon color={C.green} size={32} />
          </View>
          <Text
            style={{ color: C.textPrimary, fontSize: 26, fontWeight: "700" }}
          >
            Create account
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
            Join the carpooling community
          </Text>
        </View>

        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 20,
            padding: 24,
            borderWidth: 0.5,
            borderColor: C.border,
            marginBottom: 32,
          }}
        >
          <Field
            label="Full name"
            icon={<UserIcon />}
            value={formData.full_name}
            onChange={set("full_name")}
            placeholder="Your name"
          />
          <Field
            label="Email"
            icon={<Mail />}
            value={formData.email}
            onChange={set("email")}
            placeholder="your@email.com"
            keyboard="email-address"
          />
          <Field
            label="Password"
            icon={<Lock />}
            value={formData.password}
            onChange={set("password")}
            placeholder="••••••••"
            secure
          />
          <Field
            label="Confirm password"
            icon={<Lock />}
            value={formData.confirmPassword}
            onChange={set("confirmPassword")}
            placeholder="••••••••"
            secure
          />
          <View style={{ marginTop: 8 }}>
            <Btn
              label="Create account"
              loading={loading}
              onPress={handleSubmit}
            />
          </View>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ color: C.textMuted, fontSize: 14, marginBottom: 8 }}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: C.green, fontSize: 15, fontWeight: "600" }}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
