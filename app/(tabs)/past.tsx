import { CheckCircle2 } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { driverMoney } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import { MockScreen, ShellCard } from "../../components/mockup/ui";

export default function PastTripsScreen() {
  const { rides, currentUser } = useApp();

  const pastRides = rides.filter((r) => r.driverId === currentUser.id && r.completed);

  const totalCost = pastRides.reduce((sum, r) => sum + (r.approximateCost ?? 0), 0);

  return (
    <MockScreen>
      <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>Past Rides</Text>

      {pastRides.length === 0 ? (
        <ShellCard>
          <View style={{ padding: 32, alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={32} color={M.stone300} />
            <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 15 }}>No past rides yet</Text>
            <Text style={{ color: M.stone400, fontSize: 13, textAlign: "center" }}>
              Rides you mark as complete will appear here.
            </Text>
          </View>
        </ShellCard>
      ) : (
        <>
          {/* Summary tile */}
          <ShellCard style={{ backgroundColor: M.amber400 }}>
            <View style={{ padding: 20 }}>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700" }}>
                Total across {pastRides.length} ride{pastRides.length === 1 ? "" : "s"}
              </Text>
              <Text style={{ marginTop: 8, fontSize: 36, fontWeight: "900", color: M.white }}>
                {driverMoney(totalCost)}
              </Text>
            </View>
          </ShellCard>

          <View style={{ gap: 12 }}>
            {pastRides.map((ride) => {
              const seatsTotal = ride.seatsTotal || 4;
              const costPerPerson = ride.approximateCost
                ? ride.approximateCost / seatsTotal
                : null;
              return (
                <ShellCard key={ride.id}>
                  <View style={{ padding: 16, gap: 8 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 15 }}>
                      {ride.origin}{" "}
                      <Text style={{ color: M.amber500 }}>→</Text>{" "}
                      {ride.destination}
                    </Text>
                    <Text style={{ color: M.stone500, fontSize: 13 }}>
                      {ride.date}{ride.departureTime ? ` · ${ride.departureTime}` : ""}
                      {ride.vehicle ? `  ·  ${ride.vehicle}` : ""}
                    </Text>
                    {ride.approximateCost ? (
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                        <View style={{ flex: 1, backgroundColor: M.stone50, padding: 10, borderRadius: RADIUS.md }}>
                          <Text style={{ color: M.stone500, fontSize: 10, fontWeight: "700" }}>TOTAL COST</Text>
                          <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 15, marginTop: 2 }}>
                            {driverMoney(ride.approximateCost)}
                          </Text>
                        </View>
                        {costPerPerson ? (
                          <View style={{ flex: 1, backgroundColor: M.amber50, padding: 10, borderRadius: RADIUS.md }}>
                            <Text style={{ color: M.stone500, fontSize: 10, fontWeight: "700" }}>PER PERSON</Text>
                            <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 15, marginTop: 2 }}>
                              {driverMoney(costPerPerson)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                </ShellCard>
              );
            })}
          </View>
        </>
      )}
    </MockScreen>
  );
}
