import { useRouter } from "expo-router";
import { Car, Clock, Search } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { MRideRequest } from "../../components/mockup/data";
import { M } from "../../components/mockup/theme";
import { Btn, MockScreen, ShellCard, StatusPill } from "../../components/mockup/ui";

export default function MyRidesScreen() {
  const router = useRouter();
  const {
    upcomingTrips,
    requestBuckets,
    rides,
    currentUser,
    openCancelConfirm,
    openRequestDetailsFromRequest,
    openRideDetailsFromUpcoming,
    approveRideRequest,
    declineRideRequest,
    openPostedRideDetail,
  } = useApp();

  const myPostedRides = rides.filter((r) => r.driverId === currentUser.id && !r.completed);

  const pending = requestBuckets.pending;
  const myRequests: MRideRequest[] = [
    ...requestBuckets.pending,
    ...requestBuckets.approved,
    ...requestBuckets.declined,
  ];

  return (
    <MockScreen>
      <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>My Rides</Text>

      {/* Approval queue — show at top when there are pending requests */}
      {pending.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Clock color={M.amber500} size={18} />
            <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>Needs Approval</Text>
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
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>
                    {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 13 }}>
                    {req.pickupPoint} → {req.dropoffPoint}
                  </Text>
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

      {/* Upcoming rides */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Clock color={M.amber500} size={18} />
          <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>Upcoming</Text>
        </View>
        {upcomingTrips.length === 0 ? (
          <ShellCard>
            <View style={{ padding: 16 }}>
              <Text style={{ color: M.stone400, fontSize: 13 }}>No upcoming rides.</Text>
            </View>
          </ShellCard>
        ) : (
          upcomingTrips.map((trip) => (
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

      {/* Trips I posted */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Car color={M.amber500} size={18} />
            <Text style={{ fontSize: 16, fontWeight: "900", color: M.stone950 }}>My Posted Rides</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/post")}>
            <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 12 }}>+ New</Text>
          </TouchableOpacity>
        </View>
        {myPostedRides.length === 0 ? (
          <ShellCard>
            <View style={{ padding: 16 }}>
              <Text style={{ color: M.stone400, fontSize: 13 }}>No posted rides yet.</Text>
            </View>
          </ShellCard>
        ) : (
          myPostedRides.map((ride) => (
            <TouchableOpacity key={ride.id} activeOpacity={0.85} onPress={() => openPostedRideDetail(ride)}>
              <ShellCard>
                <View style={{ padding: 16, gap: 4 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "900", color: M.stone950 }}>
                    {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 13 }}>
                    {ride.date}{ride.departureTime ? ` · ${ride.departureTime}` : ""}
                  </Text>
                  <Text style={{ color: M.stone400, fontSize: 12, marginTop: 2 }}>
                    {ride.seatsLeft} seat{ride.seatsLeft === 1 ? "" : "s"} left · {ride.vehicle}
                  </Text>
                </View>
              </ShellCard>
            </TouchableOpacity>
          ))
        )}
      </View>
    </MockScreen>
  );
}
