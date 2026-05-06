import {
  Calendar,
  Car as CarIcon,
  Trash2,
  Users
} from "lucide-react-native";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Car } from "../../store/carSlice";
import { Trip } from "../../store/tripSlice";
import { C } from "../ui/theme";

interface TripCardProps {
  trip: Trip;
  cars: Car[];
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function TripCard({
  trip,
  cars,
  onClick,
  onDelete,
}: TripCardProps) {
  const car = cars.find((c) => c.id === trip.car_id);
  const dateStr = trip.date
    ? new Date(trip.date).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const confirmDelete = () => {
    Alert.alert("Delete trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(trip.id),
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      style={{
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: C.border,
        padding: 16,
      }}
    >
      {/* Route */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: C.green,
                marginRight: 8,
              }}
            />
            <Text
              style={{
                color: C.textPrimary,
                fontSize: 14,
                fontWeight: "500",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {trip.from_location_name || trip.from_location || "Unknown"}
            </Text>
          </View>
          <View
            style={{
              width: 0.5,
              height: 10,
              backgroundColor: C.borderMid,
              marginLeft: 3.5,
              marginBottom: 6,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: C.textMuted,
                marginRight: 8,
              }}
            />
            <Text
              style={{ color: C.textSecondary, fontSize: 14, flex: 1 }}
              numberOfLines={1}
            >
              {trip.to_location_name || trip.to_location || "Unknown"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={confirmDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 color={C.textMuted} size={16} />
        </TouchableOpacity>
      </View>

      {/* Meta row */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          paddingTop: 12,
          borderTopWidth: 0.5,
          borderTopColor: C.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Calendar color={C.textMuted} size={13} />
          <Text style={{ color: C.textMuted, fontSize: 12 }}>{dateStr}</Text>
        </View>
        {trip.passengers && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Users color={C.textMuted} size={13} />
            <Text style={{ color: C.textMuted, fontSize: 12 }}>
              {trip.passengers}p
            </Text>
          </View>
        )}
        {car && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <CarIcon color={C.textMuted} size={13} />
            <Text style={{ color: C.textMuted, fontSize: 12 }}>
              {car.make} {car.model}
            </Text>
          </View>
        )}
        {trip.savings !== undefined && trip.savings > 0 && (
          <View style={{ marginLeft: "auto" as any }}>
            <Text style={{ color: C.green, fontSize: 13, fontWeight: "700" }}>
              ${trip.savings.toFixed(2)} saved
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
