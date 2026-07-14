import React from "react";
import { Text, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { pastTrips } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import { Btn, MockScreen, ShellCard } from "../../components/mockup/ui";

export default function PastTripsScreen() {
  const { isRoutePinned, togglePinPastTrip } = useApp();

  const totalSavings = pastTrips.reduce((sum, t) => sum + t.saved, 0);

  return (
    <MockScreen>
      <ShellCard style={{ backgroundColor: M.amber400 }}>
        <View style={{ padding: 20 }}>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700" }}>
            Total Savings from Past Rides
          </Text>
          <Text style={{ marginTop: 8, fontSize: 36, fontWeight: "900", color: M.white }}>
            ${totalSavings.toFixed(2)}
          </Text>
        </View>
      </ShellCard>

      <Text style={{ fontSize: 20, fontWeight: "900", color: M.stone950, marginTop: 4 }}>Past Trips</Text>

      <View style={{ gap: 12 }}>
        {pastTrips.map((trip) => {
          const pinned = isRoutePinned(trip.route);
          return (
            <ShellCard key={trip.id}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: M.stone950 }}>{trip.route}</Text>
                  <Text style={{ color: M.stone500, fontSize: 13, marginTop: 4 }}>{trip.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={{ fontWeight: "900", color: M.amber500 }}>
                    ${trip.saved.toFixed(2)} saved
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Btn variant="secondary" style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                      Use Again
                    </Btn>
                    <Btn
                      onPress={() => togglePinPastTrip(trip.route, trip.date, trip.id)}
                      variant="muted"
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: pinned ? M.blue50 : M.stone100,
                      }}
                    >
                      <Text style={{ color: pinned ? M.blue700 : M.stone700, fontWeight: "900", fontSize: 11 }}>
                        {pinned ? "Pinned" : "Pin"}
                      </Text>
                    </Btn>
                  </View>
                </View>
              </View>
            </ShellCard>
          );
        })}
      </View>
    </MockScreen>
  );
}
