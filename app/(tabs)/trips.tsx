import { useRouter } from "expo-router";
import { ArrowDownUp, Car, ChevronRight, Clock, Search, Star } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import {
  driverMoney,
  MRequestStatus,
  MRideRequest,
  pinnedRideTemplates,
} from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import {
  Btn,
  MockScreen,
  SectionHeader,
  ShellCard,
  StatusPill,
} from "../../components/mockup/ui";

function parseTimeMinutes(time: string): number {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

const categoryBoxStyle = {
  borderWidth: 1,
  borderColor: M.stone200,
  borderRadius: RADIUS.lg,
  padding: 16,
  gap: 12,
  marginTop: 16,
  backgroundColor: M.surface,
} as const;

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

  const pending = requestBuckets.pending;
  const buckets: { key: MRequestStatus; list: MRideRequest[] }[] = [
    { key: "pending", list: requestBuckets.pending },
    { key: "approved", list: requestBuckets.approved },
    { key: "declined", list: requestBuckets.declined },
  ];

  const [sortByTime, setSortByTime] = useState(false);
  const displayedUpcoming = useMemo(() => {
    if (!sortByTime) return upcomingTrips;
    return [...upcomingTrips].sort(
      (a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time),
    );
  }, [upcomingTrips, sortByTime]);

  return (
    <MockScreen>
      <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>My Rides</Text>

      <View style={categoryBoxStyle}>
        <SectionHeader icon={<Star color={M.amber500} size={22} />} title="Pinned Recurring Rides" />
        <View style={{ gap: 12 }}>
          {pinnedRideTemplates.map((p) => (
            <ShellCard key={p.id}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                }}
              >
                <View>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}>{p.route}</Text>
                  <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>{p.schedule}</Text>
                </View>
                <Text style={{ fontWeight: "900", color: M.amber500, fontSize: 14 }}>
                  ${p.cost.toFixed(2)}
                </Text>
              </View>
            </ShellCard>
          ))}
        </View>
      </View>

      <View style={categoryBoxStyle}>
        <SectionHeader icon={<Clock color={M.amber500} size={22} />} title="Upcoming Rides" />
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => setSortByTime((v) => !v)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: sortByTime ? M.amber500 : M.stone200,
              backgroundColor: sortByTime ? M.amber50 : M.surface,
            }}
          >
            <ArrowDownUp
              size={14}
              color={sortByTime ? M.amber600 : M.stone500}
            />
            <Text
              style={{
                fontWeight: "900",
                fontSize: 12,
                color: sortByTime ? M.amber600 : M.stone600,
              }}
            >
              Sort by Time
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 12 }}>
          {displayedUpcoming.map((trip) => (
            <ShellCard key={trip.id}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => openRideDetailsFromUpcoming(trip)}>
                <View style={{ padding: 16, gap: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}>
                          {trip.route}
                        </Text>
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                            backgroundColor: trip.kind === "driver" ? M.blue50 : M.emerald50,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "900",
                              fontSize: 10,
                              color: trip.kind === "driver" ? M.blue700 : M.emerald700,
                            }}
                          >
                            {trip.kind === "driver" ? "Driver" : "Rider"}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>
                        {trip.date}, {trip.time}
                      </Text>
                      {trip.cancellableUntil ? (
                        <Text style={{ marginTop: 4, color: M.stone400, fontSize: 11 }}>
                          Cancel before {trip.cancellableUntil}
                        </Text>
                      ) : (
                        <Text style={{ marginTop: 4, color: M.stone400, fontSize: 11 }}>
                          Cancel window: TBD
                        </Text>
                      )}
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
                  <Text style={{ fontSize: 11, color: M.stone500, lineHeight: 16 }}>
                    Tap to view details (rider: pickup/drop-off, driver: full route + payments).
                  </Text>
                </View>
              </TouchableOpacity>
            </ShellCard>
          ))}
        </View>
      </View>

      {pending.length > 0 ? (
        <View style={categoryBoxStyle}>
          <SectionHeader icon={<Clock color={M.amber500} size={22} />} title="Driver Approval Queue" />
          <View style={{ gap: 12 }}>
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
                        Pickup: {req.pickupPoint} · Drop-off: {req.dropoffPoint}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Btn onPress={() => approveRideRequest(req.id)} style={{ flex: 1 }}>
                        Approve
                      </Btn>
                      <Btn onPress={() => declineRideRequest(req.id)} variant="muted" style={{ flex: 1 }}>
                        Decline
                      </Btn>
                    </View>
                  </View>
                </ShellCard>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={categoryBoxStyle}>
        <SectionHeader icon={<Search color={M.amber500} size={22} />} title="My Requests" />
        <View style={{ gap: 12 }}>
          {buckets.map((bucket) => (
            <View key={bucket.key} style={{ gap: 8 }}>
              <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 12, textTransform: "capitalize" }}>
                {bucket.key}
              </Text>
              {bucket.list.length === 0 ? (
                <Text style={{ color: M.stone400, fontSize: 11 }}>No {bucket.key} requests.</Text>
              ) : (
                bucket.list.map((req) => {
                  const ride = rides.find((r) => r.id === req.rideId);
                  if (!ride) return null;
                  return (
                    <TouchableOpacity key={req.id} onPress={() => openRequestDetailsFromRequest(req)}>
                      <ShellCard>
                        <View style={{ padding: 16, gap: 8 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: "900", color: M.stone950 }}>
                                {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                              </Text>
                              <Text style={{ marginTop: 4, color: M.stone500, fontSize: 13 }}>
                                Pickup: {req.pickupPoint} · Drop-off: {req.dropoffPoint}
                              </Text>
                            </View>
                            <StatusPill status={req.status} />
                          </View>
                        </View>
                      </ShellCard>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={categoryBoxStyle}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Car color={M.amber500} size={22} />
            <Text style={{ fontSize: 20, fontWeight: "900", color: M.stone950 }}>Driver Trips</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/post")}>
            <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 12 }}>Create in Post Ride</Text>
          </TouchableOpacity>
        </View>

        {driverTrips.length === 0 ? (
          <ShellCard>
            <View style={{ padding: 16, gap: 8 }}>
              <Text style={{ fontWeight: "700", color: M.stone600, fontSize: 13 }}>No driver trips yet.</Text>
              <Text style={{ color: M.stone500, fontSize: 11 }}>
                Create one from Post Ride → Create New Ride.
              </Text>
            </View>
          </ShellCard>
        ) : (
          <View style={{ gap: 12 }}>
            {driverTrips.map((trip) => {
              const paid = (trip.recipientIds || []).filter((id) => trip.paidById?.[id]).length;
              return (
                <TouchableOpacity key={trip.id} onPress={() => setDriverTripDetailsId(trip.id)}>
                  <ShellCard>
                    <View style={{ padding: 16, gap: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>
                            {trip.origin} <Text style={{ color: M.amber500 }}>→</Text> {trip.destination}
                          </Text>
                          <Text style={{ marginTop: 4, color: M.stone500, fontSize: 11 }}>
                            {trip.carLabel}
                          </Text>
                        </View>
                        <ChevronRight color={M.amber500} size={22} />
                      </View>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {[
                          { label: "total", value: driverMoney(trip.totalCost) },
                          { label: "you save", value: driverMoney(trip.driverSavings) },
                          { label: "paid", value: `${paid}/${(trip.recipientIds || []).length}` },
                        ].map((tile) => (
                          <View
                            key={tile.label}
                            style={{
                              flex: 1,
                              backgroundColor: M.stone50,
                              padding: 10,
                              borderRadius: RADIUS.md,
                            }}
                          >
                            <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 10 }}>
                              {tile.label}
                            </Text>
                            <Text style={{ marginTop: 4, fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                              {tile.value}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <Text style={{ fontSize: 11, color: M.stone500 }}>
                        each rider pays: {driverMoney(trip.perRiderCost)}
                      </Text>
                    </View>
                  </ShellCard>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </MockScreen>
  );
}
