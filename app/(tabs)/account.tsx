import { useRouter } from "expo-router";
import { Edit2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { Btn, Card } from "../../components/ui/primitives";
import { C, FONT } from "../../components/ui/theme";
import { UserService } from "../../store/all";
import { clearUser, UserState } from "../../store/userSlice";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
      }}
    >
      <Text style={{ color: C.textMuted, fontSize: 14 }}>{label}</Text>
      <Text
        style={{
          color: C.textPrimary,
          fontSize: 14,
          fontWeight: "500",
          maxWidth: "60%",
          textAlign: "right",
        }}
      >
        {value || "Not set"}
      </Text>
    </View>
  );
}

export default function AccountScreen() {
  const [user, setUser] = useState<UserState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserService.me();
      const norm: UserState = {
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      };
      setUser(norm);
      setFormData({
        full_name: norm.full_name,
        phone: norm.phone,
        address: norm.address,
      });
    } catch (e) {
      console.error("Error loading user:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await UserService.updateMyUserData(formData);
      setIsEditing(false);
      loadUser();
    } catch (e) {
      console.error("Error updating user:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await UserService.logout();
      dispatch(clearUser());
      router.push("/login");
    } catch (e) {
      console.error("Error logging out:", e);
    }
  };

  if (loading)
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

  const initials = (user?.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <View style={{ alignItems: "center", paddingTop: 72, paddingBottom: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: C.greenTint,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: C.green,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: C.green, fontSize: 28, fontWeight: "700" }}>
            {initials}
          </Text>
        </View>
        <Text style={{ color: C.textPrimary, fontSize: 22, fontWeight: "700" }}>
          {user?.full_name || "User"}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 14, marginTop: 4 }}>
          {user?.email}
        </Text>
      </View>

      {/* Personal info card */}
      <Card style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: C.border,
          }}
        >
          <Text style={FONT.sectionTitle}>Personal information</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit2 color={isEditing ? C.green : C.textMuted} size={18} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          {isEditing ? (
            <View>
              {[
                {
                  label: "Full name",
                  key: "full_name",
                  placeholder: "Your name",
                },
                {
                  label: "Phone",
                  key: "phone",
                  placeholder: "+1 (555) 000-0000",
                  keyboard: "phone-pad",
                },
                {
                  label: "Address",
                  key: "address",
                  placeholder: "Your address",
                },
              ].map(({ label, key, placeholder, keyboard }) => (
                <View key={key} style={{ marginBottom: 14 }}>
                  <Text
                    style={{
                      color: C.textMuted,
                      fontSize: 11,
                      fontWeight: "600",
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: C.surfaceAlt,
                      borderWidth: 1,
                      borderColor: C.borderMid,
                      borderRadius: C.radius,
                      height: 48,
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <TextInput
                      value={(formData as any)[key]}
                      onChangeText={(t) =>
                        setFormData((p) => ({ ...p, [key]: t }))
                      }
                      placeholder={placeholder}
                      placeholderTextColor={C.textMuted}
                      keyboardType={keyboard as any}
                      style={{
                        color: C.textPrimary,
                        fontSize: 15,
                        paddingVertical: 0,
                      }}
                    />
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <Btn
                  label="Cancel"
                  variant="outline"
                  onPress={() => setIsEditing(false)}
                  style={{ flex: 1 }}
                />
                <Btn
                  label="Save"
                  loading={saving}
                  onPress={handleSave}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View>
              <InfoRow label="Full name" value={user?.full_name || ""} />
              <InfoRow label="Email" value={user?.email || ""} />
              <InfoRow label="Phone" value={user?.phone || ""} />
              <InfoRow label="Address" value={user?.address || ""} />
            </View>
          )}
        </View>
      </Card>

      {/* Sign out */}
      <Btn label="Sign out" variant="danger" onPress={handleLogout} />
    </ScrollView>
  );
}
