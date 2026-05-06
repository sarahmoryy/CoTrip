import { Edit2, Fuel, Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Car } from "../../store/carSlice";
import { C } from "../ui/theme";

interface Props {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
}

export default function CarCard({ car, onEdit, onDelete }: Props) {
  const confirmDelete = () => {
    Alert.alert("Remove car", `Remove ${car.make} ${car.model}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onDelete(car.id) },
    ]);
  };

  const initials = `${car.make[0] || ""}${car.model[0] || ""}`.toUpperCase();

  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: C.border,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: C.greenTint,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <Text style={{ color: C.green, fontSize: 16, fontWeight: "700" }}>
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: C.textPrimary, fontSize: 16, fontWeight: "600" }}
            numberOfLines={1}
          >
            {car.make} {car.model}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>
            {car.year}
          </Text>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            onPress={() => onEdit(car)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit2 color={C.textMuted} size={17} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 color={C.textMuted} size={17} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fuel stat */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 14,
          paddingTop: 14,
          borderTopWidth: 0.5,
          borderTopColor: C.border,
        }}
      >
        <Fuel color={C.textMuted} size={14} style={{ marginRight: 6 }} />
        <Text style={{ color: C.textMuted, fontSize: 13 }}>Consumption</Text>
        <Text
          style={{
            color: C.green,
            fontSize: 13,
            fontWeight: "600",
            marginLeft: "auto" as any,
          }}
        >
          {car.consumption_l_100km
            ? `${car.consumption_l_100km} L/100km`
            : `${car.fuel_efficiency || 25} MPG`}
        </Text>
      </View>
    </View>
  );
}
