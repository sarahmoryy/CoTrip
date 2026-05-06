import React from "react";
import { Modal, Text, View } from "react-native";
import { Car } from "../../store/carSlice";
import { Trip } from "../../store/tripSlice";
import { Btn, ModalShell } from "../ui/primitives";
import { C } from "../ui/theme";

interface Props {
  trip: Trip;
  cars: Car[];
  onEditLocations: () => void;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
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
      <Text style={{ color: C.textPrimary, fontSize: 14, fontWeight: "500" }}>
        {value}
      </Text>
    </View>
  );
}

export default function TripDetails({
  trip,
  cars,
  onEditLocations,
  onClose,
}: Props) {
  const car = cars.find((c) => c.id === trip.car_id);
  const dateStr = trip.date
    ? new Date(trip.date).toLocaleDateString("en-CA", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <Modal transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ModalShell title="Trip details" subtitle={dateStr} onClose={onClose}>
          {/* Route visual */}
          <View
            style={{
              backgroundColor: "#0d1117",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 0.5,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: C.green,
                  marginRight: 10,
                }}
              />
              <Text
                style={{ color: C.textPrimary, fontSize: 14 }}
                numberOfLines={1}
              >
                {trip.from_location_name || trip.from_location || "Unknown"}
              </Text>
            </View>
            <View
              style={{
                width: 1,
                height: 16,
                backgroundColor: C.borderMid,
                marginLeft: 4.5,
                marginBottom: 10,
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: C.textMuted,
                  marginRight: 10,
                }}
              />
              <Text
                style={{ color: C.textSecondary, fontSize: 14 }}
                numberOfLines={1}
              >
                {trip.to_location_name || trip.to_location || "Unknown"}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={{ marginBottom: 20 }}>
            <DetailRow
              label="Car"
              value={car ? `${car.year} ${car.make} ${car.model}` : "N/A"}
            />
            <DetailRow label="Passengers" value={trip.passengers || "N/A"} />
            <DetailRow
              label="Distance"
              value={
                trip.distance !== undefined
                  ? `${trip.distance.toFixed(1)} km`
                  : "N/A"
              }
            />
            <DetailRow
              label="Trip cost"
              value={
                trip.cost !== undefined ? `$${trip.cost.toFixed(2)}` : "N/A"
              }
            />
            <DetailRow
              label="Your savings"
              value={
                trip.savings !== undefined
                  ? `$${trip.savings.toFixed(2)}`
                  : "$0.00"
              }
            />
          </View>

          <Btn label="Edit trip" variant="outline" onPress={onEditLocations} />
        </ModalShell>
      </View>
    </Modal>
  );
}
