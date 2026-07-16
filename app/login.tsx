import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Btn } from "../components/ui/primitives";
import { useTheme } from "../components/ui/theme";
import { UserService } from "../store/all";

export default function LoginScreen() {
  const { C } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const router = useRouter();

  const signin = async () => {
    try {
      setLoading(true);
      await UserService.login(formData.email.trim(), formData.password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      alert("Sign-in failed: " + (error?.message ?? String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 80,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View
            style={{
              width: 72,
              height: 72,
              backgroundColor: C.greenTint,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0.5,
              borderColor: "rgba(74,222,128,0.25)",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 30 }}>🚗</Text>
          </View>
          <Text
            style={{
              color: C.textPrimary,
              fontSize: 34,
              fontWeight: "700",
              letterSpacing: -0.5,
            }}
          >
            Co<Text style={{ color: C.green }}>Trip</Text>
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
            share the road, share the cost
          </Text>
        </View>

        {/* Card */}
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
          {/* Email */}
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
              Email
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.surfaceAlt,
                borderWidth: 1,
                borderColor: emailFocused ? C.borderFocus : C.borderMid,
                borderRadius: C.radius,
                height: 52,
                paddingHorizontal: 12,
              }}
            >
              <Mail
                color={emailFocused ? C.green : C.textMuted}
                size={16}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={formData.email}
                onChangeText={(t) => setFormData((p) => ({ ...p, email: t }))}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="your@email.com"
                placeholderTextColor={C.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                style={{
                  flex: 1,
                  color: C.textPrimary,
                  fontSize: 15,
                  paddingVertical: 0,
                }}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 24 }}>
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
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.surfaceAlt,
                borderWidth: 1,
                borderColor: passFocused ? C.borderFocus : C.borderMid,
                borderRadius: C.radius,
                height: 52,
                paddingHorizontal: 12,
              }}
            >
              <Lock
                color={passFocused ? C.green : C.textMuted}
                size={16}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={formData.password}
                onChangeText={(t) =>
                  setFormData((p) => ({ ...p, password: t }))
                }
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={C.textMuted}
                secureTextEntry
                autoCorrect={false}
                textContentType="password"
                autoComplete="password"
                style={{
                  flex: 1,
                  color: C.textPrimary,
                  fontSize: 15,
                  paddingVertical: 0,
                }}
              />
            </View>
          </View>

          <Btn label="Sign in" loading={loading} onPress={signin} />
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ color: C.textMuted, fontSize: 14, marginBottom: 8 }}>
            New to carpooling?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/signup")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: C.green, fontSize: 15, fontWeight: "600" }}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
