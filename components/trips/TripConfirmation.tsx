import LottieView from "lottie-react-native";
import { ShieldCheck } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Modal, Text, View } from "react-native";
import { Trip } from "../../store/tripSlice";
import { Btn, ModalShell } from "../ui/primitives";
import { useTheme } from "../ui/theme";

interface Props {
  trip: Trip;
  onConfirm: (updated: Trip) => void;
  onCancel: () => void;
}

export default function TripConfirmation({ trip, onConfirm, onCancel }: Props) {
  const { C } = useTheme();
  const [showAnimation, setShowAnimation] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { totalPeople, sharePerPerson, computedSavings } = useMemo(() => {
    const nPassengers = trip.passengers ? parseInt(trip.passengers, 10) : 0;
    const people = Math.max(1, nPassengers + 1);
    const totalCost = typeof trip.cost === "number" ? trip.cost : 0;
    const perPerson = totalCost / people;
    return {
      totalPeople: people,
      sharePerPerson: perPerson,
      computedSavings: Number((perPerson * nPassengers).toFixed(2)),
    };
  }, [trip.passengers, trip.cost]);

  const updatedTrip: Trip = { ...trip, savings: computedSavings };

  const handleConfirm = () => {
    setShowAnimation(true);
    animationRef.current?.play();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setShowAnimation(false);
        onConfirm(updatedTrip);
      });
    }, 3000);
  };

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
        <ModalShell
          title="Review your trip"
          subtitle={`${trip.distance !== undefined ? trip.distance.toFixed(1) : "N/A"} km route`}
          onClose={onCancel}
        >
          {showAnimation && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.75)",
                borderRadius: 20,
                zIndex: 10,
              }}
            >
              <LottieView
                ref={animationRef}
                source={require("../../assets/animations/piggy_bank.json")}
                autoPlay
                loop={false}
                style={{ width: 160, height: 160 }}
              />
            </Animated.View>
          )}

          {/* Cost breakdown */}
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
                justifyContent: "space-between",
                paddingVertical: 10,
                borderBottomWidth: 0.5,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 14 }}>
                Total trip cost
              </Text>
              <Text
                style={{
                  color: C.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                ${typeof trip.cost === "number" ? trip.cost.toFixed(2) : "0.00"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
                borderBottomWidth: 0.5,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 14 }}>
                Split {totalPeople} ways
              </Text>
              <Text
                style={{
                  color: C.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                ${sharePerPerson.toFixed(2)} / person
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <ShieldCheck color={C.green} size={16} />
                <Text style={{ color: C.textMuted, fontSize: 14 }}>
                  Your savings
                </Text>
              </View>
              <Text style={{ color: C.green, fontSize: 18, fontWeight: "700" }}>
                ${computedSavings.toFixed(2)}
              </Text>
            </View>
          </View>

          <Btn
            label={showAnimation ? "Processing..." : "Confirm CoTrip"}
            disabled={showAnimation}
            onPress={handleConfirm}
            style={{ marginBottom: 12 }}
          />
          <Btn
            label="Share with passengers"
            variant="outline"
            onPress={onCancel}
          />
        </ModalShell>
      </View>
    </Modal>
  );
}
