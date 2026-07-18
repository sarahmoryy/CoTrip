import { useRouter } from "expo-router";
import { Car, ChevronRight, Clock, Search } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { driverMoney, MRideRequest } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import {
  Btn,
  MockScreen,
  ShellCard,
  StatusPill,
} from "../../components/mockup/ui";

type Tab = "rider" | "driver";

export default function MyRidesScreen() {
  const router = useRouter();
  const {
    upcomingTrips,
    requestBuckets,
    rides,
    driverTrips,
    setDriverTripDetailsId,
    openCancelConfirm,
    openRequestDetailsFromRequest,
    openRideDetailsFromUpcoming,
    approveRideRequest,
    declineRideRequest,
  } = useApp();

  const [tab, setTab] = useState<Tab>("rider");

  const riderUpcoming = upcomingTrips.filter((t) => t.kind === "rider");
  const driverUpcoming = upcomingTrips.filter((t) => t.kind === "driver");
  const pending = requestBuckets.pending;
  const myRequests: MRideRequest[] = [
    ...requestBuckets.pending,
    ...requestBuckets.approved,
    ...requestBuckets.declined,
  ];

  return (
    <MockScreen>
      <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>My Rides</Text>

      {/* Tab toggle */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: M.stone100,
          borderRadius: RADIUS.lg,
          padding: 4,
        }}
      >
        {(["rider", "driver"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: RADIUS.md,
              alignItems: "center",
              backgroundColor: tab === t ? M.white : "transparent",
              shadowColor: tab === t ? "#000" : "transparent",
              shadowOpacity: tab === t ? 0.06 : 0,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            <Text
              style={{
                fontWeight: "900",
                fontSize: 14,
                color: tab === t ? M.stone950 : M.stone500,
              }}
            >
              {t === "rider" ? "Rider" : "Driver"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "rider" ? (
        <>
          {/* Upcoming as rider */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Clock color={M.amber500} size={18} />
              <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>Upcoming</Text>
            </View>
            {riderUpcoming.length === 0 ? (
              <ShellCard>
                <View style={{ padding: 16 }}>
                  <Text style={{ color: M.stone400, fontSize: 13 }}>No upcoming rides.</Text>
                </View>
              </ShellCard>
            ) : (
              riderUpcoming.map((trip) => (
                <ShellCard key={trip.id}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openRideDetailsFromUpcoming(trip)}>
                    <View style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}>
                          {trip.route}
                        </Text>
                        <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>
                          {trip.date} · {trip.time}
                        </Text>
                        {trip.cancellableUntil ? (
                          <Text style={{ marginTop: 2, color: M.stone400, fontSize: 11 }}>
                            Cancel before {trip.cancellableUntil}
                          </Text>
                        ) : null}
                      </View>
                      <Btn
                        onPress={() => openCancelConfirm(trip)}
                        variant={trip.canCancel ? "primary" : "muted"}
                        disabled={!trip.canCancel}
                        style={{ paddingHorizontal: 14, paddingVertical: 8 }}
                      >
                        {trip.canCancel ? "Cancel" : "Locked"}
                      </Btn>
                    </View>
                  </TouchableOpacity>
                </ShellCard>
              ))
            )}
          </View>

          {/* My requests */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Search color={M.amber500} size={18} />
              <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>My Requests</Text>
            </View>
            {myRequests.length === 0 ? (
              <ShellCard>
                <View style={{ padding: 16 }}>
                  <Text style={{ color: M.stone400, fontSize: 13 }}>No requests yet.</Text>
                </View>
              </ShellCard>
            ) : (
              myRequests.map((req) => {
                const ride = rides.find((r) => r.id === req.rideId);
                if (!ride) return null;
                return (
                  <TouchableOpacity key={req.id} onPress={() => openRequestDetailsFromRequest(req)}>
                    <ShellCard>
                      <View style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "900", color: M.stone950 }}>
                            {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                          </Text>
                          <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>
                            {req.pickupPoint} → {req.dropoffPoint}
                          </Text>
                        </View>
                        <StatusPill status={req.status} />
                      </View>
                    </ShellCard>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </>
      ) : (
        <>
          {/* Approval queue */}
          {pending.length > 0 && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Clock color={M.amber500} size={18} />
                <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>Approval Queue</Text>
                <View style={{ backgroundColor: M.amber400, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ color: M.white, fontWeight: "900", fontSize: 11 }}>{pending.length}</Text>
                </View>
              </View>
              {pending.map((req) => {
                const ride = rides.find((r) => r.id === req.rideId);
                if (!ride) return null;
                return (
                  <ShellCard key={req.id}>
                    <View style={{ padding: 16, gap: 12 }}>
                      <View>
                        <Text style={{ fontWeight: "900", color: M.stone950 }}>
                          {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                        </Text>
                        <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>
                          {req.pickupPoint} → {req.dropoffPoint}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Btn onPress={() => approveRideRequest(req.id)} style={{ flex: 1 }}>Approve</Btn>
                        <Btn onPress={() => declineRideRequest(req.id)} variant="muted" style={{ flex: 1 }}>Decline</Btn>
                      </View>
                    </View>
                  </ShellCard>
                );
              })}
            </View>
          )}

          {/* Upcoming as driver */}
          {driverUpcoming.length > 0 && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Clock color={M.amber500} size={18} />
                <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>Upcoming</Text>
              </View>
              {driverUpcoming.map((trip) => (
                <ShellCard key={trip.id}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openRideDetailsFromUpcoming(trip)}>
                    <View style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}>
                          {trip.route}
                        </Text>
                        <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>
                          {trip.date} · {trip.time}
                        </Text>
                      </View>
                      <Btn
                        onPress={() => openCancelConfirm(trip)}
                        variant={trip.canCancel ? "primary" : "muted"}
                        disabled={!trip.canCancel}
                        style={{ paddingHorizontal: 14, paddingVertical: 8 }}
                      >
                        {trip.canCancel ? "Cancel" : "Locked"}
                      </Btn>
                    </View>
                  </TouchableOpacity>
                </ShellCard>
              ))}
            </View>
          )}

          {/* Driver trips */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Car color={M.amber500} size={18} />
                <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>Driver Trips</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/post")}>
                <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 12 }}>+ New</Text>
              </TouchableOpacity>
            </View>
            {driverTrips.length === 0 ? (
              <ShellCard>
                <View style={{ padding: 16 }}>
                  <Text style={{ color: M.stone400, fontSize: 13 }}>No driver trips yet.</Text>
                </View>
              </ShellCard>
            ) : (
              driverTrips.map((trip) => {
                const paid = (trip.recipientIds || []).filter((id) => trip.paidById?.[id]).length;
                return (
                  <TouchableOpacity key={trip.id} onPress={() => setDriverTripDetailsId(trip.id)}>
                    <ShellCard>
                      <View style={{ padding: 16, gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "900", color: M.stone950 }}>
                              {trip.origin} <Text style={{ color: M.amber500 }}>→</Text> {trip.destination}
                            </Text>
                            <Text style={{ marginTop: 2, color: M.stone500, fontSize: 11 }}>{trip.carLabel}</Text>
                          </View>
                          <ChevronRight color={M.amber500} size={20} />
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          {[
                            { label: "total", value: driverMoney(trip.totalCost) },
                            { label: "you save", value: driverMoney(trip.driverSavings) },
                            { label: "paid", value: `${paid}/${(trip.recipientIds || []).length}` },
                          ].map((tile) => (
                            <View key={tile.label} style={{ flex: 1, backgroundColor: M.stone50, padding: 10, borderRadius: RADIUS.md }}>
                              <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 10 }}>{tile.label}</Text>
                              <Text style={{ marginTop: 4, fontWeight: "900", color: M.stone950, fontSize: 13 }}>{tile.value}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </ShellCard>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </>
      )}
    </MockScreen>
  );
}
