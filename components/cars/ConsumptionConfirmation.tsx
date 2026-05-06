import { Fuel } from "lucide-react-native";
import React from "react";
import { Modal, Text, View } from "react-native";
import { Car } from "../../store/carSlice";
import { Btn, ModalShell } from "../ui/primitives";
import { C, FONT } from "../ui/theme";

interface Props {
  car: Car;
  consumption: number;
  onConfirm: (car: Car) => void;
  onReturn: () => void;
}

export default function ConsumptionConfirmation({
  car,
  consumption,
  onConfirm,
  onReturn,
}: Props) {
  const mpg = Math.round((235.2 / consumption) * 10) / 10;
  const handleConfirm = () =>
    onConfirm({
      ...car,
      consumption_l_100km: consumption,
      fuel_efficiency: mpg,
    });

  return (
    <Modal
      transparent={false}
      visible
      animationType="slide"
      onRequestClose={onReturn}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <ModalShell
          title="Fuel consumption"
          subtitle={`${car.year} ${car.make} ${car.model}`}
          onClose={onReturn}
        >
          <Text
            style={[
              FONT.bodyMuted,
              { textAlign: "center", lineHeight: 20, marginBottom: 20 },
            ]}
          >
            Based on the vehicle data, we found an estimated consumption for
            your car.
          </Text>

          {/* Stat block */}
          <View
            style={{
              backgroundColor: "#0d1117",
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
              marginBottom: 24,
              borderWidth: 0.5,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: C.greenTint,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Fuel color={C.green} size={24} />
            </View>
            <Text
              style={{ color: C.textPrimary, fontSize: 32, fontWeight: "700" }}
            >
              {consumption}{" "}
              <Text
                style={{ fontSize: 18, fontWeight: "400", color: C.textMuted }}
              >
                L/100km
              </Text>
            </Text>
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 8 }}>
              or
            </Text>
            <Text
              style={{
                color: C.green,
                fontSize: 20,
                fontWeight: "600",
                marginTop: 4,
              }}
            >
              {mpg} MPG
            </Text>
          </View>

          <Btn
            label="Use this value"
            onPress={handleConfirm}
            style={{ marginBottom: 12 }}
          />
          <Btn label="Enter manually" variant="outline" onPress={onReturn} />
        </ModalShell>
      </View>
    </Modal>
  );
}
