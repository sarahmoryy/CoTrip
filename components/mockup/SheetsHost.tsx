import {
  Car,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  Plus,
  Search,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "./AppContext";
import {
  DRIVER_GAS_PRICE_PER_L,
  driverEstimateDistanceKm,
  driverMoney,
  findUser,
  MCarOwned,
  RIDER_GAS_VARIATION_PCT,
} from "./data";
import { M, RADIUS } from "./theme";
import {
  Btn,
  DriverChip,
  DriverStars,
  OrderedAvatarRow,
  QuickMessageButtons,
  RatingBadge,
  ReviewBox,
  RoundIcon,
  Sheet,
  ShellCard,
  StatusPill,
  textInputStyle,
} from "./ui";

function CarSearchField({
  label,
  placeholder,
  value,
  options,
  loading,
  disabled,
  resetToken,
  onCommit,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  loading?: boolean;
  disabled?: boolean;
  resetToken: boolean;
  onCommit: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuery(value);
    setError("");
    setShowSuggestions(false);
  }, [value, resetToken]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return list.slice(0, 6);
  }, [query, options]);

  const commit = (v: string) => {
    setQuery(v);
    setError("");
    setShowSuggestions(false);
    onCommit(v);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
    const q = query.trim();
    if (!q || q.toLowerCase() === value.toLowerCase()) return;
    const match = options.find((o) => o.toLowerCase() === q.toLowerCase());
    if (match) {
      commit(match);
    } else {
      setError(`No ${label} found matching "${query}"`);
    }
  };

  return (
    <View style={{ gap: 6, opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>{label}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: M.amber50,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          borderColor: error ? M.red600 : M.amber100,
          paddingHorizontal: 12,
        }}
      >
        <Search size={14} color={M.stone500} />
        <TextInput
          editable={!disabled}
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setError("");
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={M.stone400}
          style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: M.stone800 }}
        />
        {loading ? <ActivityIndicator size="small" color={M.amber500} /> : null}
      </View>

      {!!error && (
        <Text style={{ color: M.red600, fontSize: 11, fontWeight: "700" }}>{error}</Text>
      )}

      {showSuggestions && !disabled && suggestions.length > 0 && (
        <View
          style={{
            backgroundColor: M.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: M.amber100,
            overflow: "hidden",
          }}
        >
          {suggestions.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              onPress={() => commit(opt)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 11,
                borderBottomWidth: i !== suggestions.length - 1 ? 0.5 : 0,
                borderBottomColor: M.amber100,
              }}
            >
              <Text style={{ color: M.stone800, fontSize: 14 }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function PostedRideDetailContent() {
  const a = useApp();
  const ride = a.selectedPostedRide!;
  const seatsTotal = ride.seatsTotal || 4;
  const approvedRequests = a.rideRequests.filter(
    (r) => r.rideId === ride.id && r.status === "approved"
  );
  const pendingRequests = a.rideRequests.filter(
    (r) => r.rideId === ride.id && r.status === "pending"
  );

  return (
    <View style={{ gap: 16 }}>
      {/* Route */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 20 }}>{ride.origin}</Text>
        <Text style={{ color: M.amber500, fontWeight: "900", fontSize: 14 }}>↓</Text>
        <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 20 }}>{ride.destination}</Text>
        <Text style={{ color: M.stone500, fontSize: 13, marginTop: 4 }}>
          {ride.date}{ride.departureTime ? ` · ${ride.departureTime}` : ""}
          {ride.vehicle ? `  ·  ${ride.vehicle}` : ""}
        </Text>
      </View>

      {/* Tiles */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
          <Text style={{ color: M.stone500, fontSize: 11, fontWeight: "700" }}>SEATS LEFT</Text>
          <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18, marginTop: 4 }}>
            {ride.seatsLeft ?? seatsTotal - approvedRequests.length}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
          <Text style={{ color: M.stone500, fontSize: 11, fontWeight: "700" }}>JOINED</Text>
          <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18, marginTop: 4 }}>
            {approvedRequests.length}
          </Text>
        </View>
        {ride.approximateCost ? (
          <View style={{ flex: 1, backgroundColor: M.amber50, padding: 12, borderRadius: RADIUS.md }}>
            <Text style={{ color: M.stone500, fontSize: 11, fontWeight: "700" }}>EST. / PERSON</Text>
            <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 18, marginTop: 4 }}>
              {driverMoney(ride.approximateCost / seatsTotal)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Riders */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "700", color: M.stone500, fontSize: 12 }}>
          RIDERS ({approvedRequests.length})
        </Text>
        {approvedRequests.length === 0 ? (
          <Text style={{ color: M.stone400, fontSize: 13 }}>No one has joined yet.</Text>
        ) : (
          approvedRequests.map((req) => {
            const displayName = req.riderName || a.users.find((u) => u.id === req.riderId)?.name || "Unknown";
            return (
              <View key={req.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: M.stone50, padding: 10, borderRadius: RADIUS.md }}>
                <Image
                  source={{ uri: `https://i.pravatar.cc/80?u=${req.riderId}` }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                    {displayName}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 11 }}>
                    {req.pickupPoint} → {req.dropoffPoint}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Remove Rider", `Remove ${displayName} from the ride?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Remove", style: "destructive", onPress: () => a.removeRider(req.id) },
                    ])
                  }
                >
                  <Text style={{ color: M.stone400, fontSize: 11, fontWeight: "700" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        {pendingRequests.length > 0 && (
          <Text style={{ color: M.stone400, fontSize: 12 }}>
            +{pendingRequests.length} pending request{pendingRequests.length > 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {ride.completed ? (
        <View style={{ backgroundColor: M.stone100, padding: 12, borderRadius: RADIUS.md, alignItems: "center" }}>
          <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 13 }}>This ride is complete.</Text>
        </View>
      ) : (
        <Btn
          onPress={() =>
            Alert.alert("Mark Complete", "Confirm this ride is done?", [
              { text: "Cancel", style: "cancel" },
              { text: "Mark Complete", onPress: () => a.markRideComplete(ride.id) },
            ])
          }
          variant="dark"
          style={{ height: 50 }}
        >
          Mark as Complete
        </Btn>
      )}
    </View>
  );
}

export default function SheetsHost() {
  const a = useApp();

  return (
    <>
      {/* Notifications */}
      <Sheet open={a.notificationsOpen} title="Notifications" onClose={a.closeNotifications}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: M.stone500, fontSize: 11, fontWeight: "600" }}>
              Unread: {a.unreadNotificationsCount}
            </Text>
            <Btn
              onPress={a.markAllNotificationsRead}
              variant="muted"
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            >
              mark all read
            </Btn>
          </View>
          {a.notifications.length === 0 ? (
            <ShellCard>
              <View style={{ padding: 16 }}>
                <Text style={{ color: M.stone500, fontSize: 13 }}>No notifications yet.</Text>
              </View>
            </ShellCard>
          ) : (
            a.notifications.map((n) => (
              <TouchableOpacity key={n.id} onPress={() => a.markNotificationRead(n.id)}>
                <ShellCard>
                  <View style={{ padding: 16, gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <Text style={{ fontWeight: "900", color: M.stone950 }}>{n.title}</Text>
                      {!n.read ? (
                        <View
                          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: M.amber500, marginTop: 6 }}
                        />
                      ) : null}
                    </View>
                    {n.body ? <Text style={{ color: M.stone600, fontSize: 13 }}>{n.body}</Text> : null}
                    <Text style={{ color: M.stone400, fontWeight: "600", fontSize: 10 }}>{n.at}</Text>
                  </View>
                </ShellCard>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Sheet>

      {/* Car Picker */}
      <Sheet open={a.carPickerOpen} title="Select a car" onClose={a.closeCarPicker}>
        <View style={{ gap: 12 }}>
          {a.driverCars.length === 0 ? (
            <ShellCard>
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: M.stone500, fontSize: 13 }}>
                  No cars yet. Add one from Post Ride → My cars.
                </Text>
              </View>
            </ShellCard>
          ) : (
            a.driverCars.map((dc) => {
              const car: MCarOwned = {
                id: dc.id,
                name: `${dc.year} ${dc.make} ${dc.model}`,
                seats: 4,
                costPerKm: (dc.consumptionLPer100 * DRIVER_GAS_PRICE_PER_L) / 100,
              };
              return (
                <TouchableOpacity key={car.id} onPress={() => a.selectCarForPosting(car)}>
                  <ShellCard>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16 }}>
                      <RoundIcon>
                        <Car color={M.white} size={28} />
                      </RoundIcon>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "900", color: M.stone950 }}>{car.name}</Text>
                        <Text style={{ color: M.stone500, fontSize: 13 }}>
                          {car.seats} seats · ${car.costPerKm.toFixed(2)}/km estimate
                        </Text>
                      </View>
                    </View>
                  </ShellCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </Sheet>

      {/* Ride Detail */}
      <Sheet open={!!a.selectedRideDetail} title="Ride Details" onClose={a.closeRideDetail}>
        {a.selectedRideDetail ? (() => {
          const ride = a.selectedRideDetail!;
          const seatsTotal = ride.seatsTotal || 4;
          const approvedRequests = a.rideRequests.filter(
            (r) => r.rideId === ride.id && r.status === "approved"
          );
          const pendingRequests = a.rideRequests.filter(
            (r) => r.rideId === ride.id && r.status === "pending"
          );
          const myRequest = a.rideRequests.find(
            (r) => r.rideId === ride.id && r.riderId === a.currentUser.id
          );
          const isDriver = ride.driverId === a.currentUser.id;
          const costPerRider = ride.approximateCost ? ride.approximateCost / seatsTotal : 0;
          return (
            <View style={{ gap: 16 }}>
              {/* Route */}
              <View style={{ gap: 4 }}>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 20 }}>{ride.origin}</Text>
                <Text style={{ color: M.amber500, fontWeight: "900", fontSize: 14 }}>↓</Text>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 20 }}>{ride.destination}</Text>
                <Text style={{ color: M.stone500, fontSize: 13, marginTop: 4 }}>
                  {ride.date}{ride.departureTime ? ` · ${ride.departureTime}` : ""}
                  {ride.vehicle ? `  ·  ${ride.vehicle}` : ""}
                </Text>
              </View>

              {/* Cost + seats summary */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
                  <Text style={{ color: M.stone500, fontSize: 11, fontWeight: "700" }}>SEATS LEFT</Text>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18, marginTop: 4 }}>
                    {ride.seatsLeft ?? seatsTotal - approvedRequests.length}
                  </Text>
                </View>
                {costPerRider > 0 && (
                  <View style={{ flex: 1, backgroundColor: M.amber50, padding: 12, borderRadius: RADIUS.md }}>
                    <Text style={{ color: M.stone500, fontSize: 11, fontWeight: "700" }}>EST. / PERSON</Text>
                    <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 18, marginTop: 4 }}>
                      {driverMoney(costPerRider)}
                    </Text>
                  </View>
                )}
              </View>

              {/* People already in the ride */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: "700", color: M.stone500, fontSize: 12 }}>
                  IN THIS RIDE ({approvedRequests.length})
                </Text>
                {approvedRequests.length === 0 ? (
                  <Text style={{ color: M.stone400, fontSize: 13 }}>No one has joined yet.</Text>
                ) : (
                  approvedRequests.map((req) => {
                    const user = a.users.find((u) => u.id === req.riderId);
                    return (
                      <View key={req.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: M.stone50, padding: 10, borderRadius: RADIUS.md }}>
                        <Image
                          source={{ uri: user?.avatar || `https://i.pravatar.cc/80?u=${req.riderId}` }}
                          style={{ width: 36, height: 36, borderRadius: 18 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                            {user?.name || "Rider"}
                          </Text>
                          <Text style={{ color: M.stone500, fontSize: 11 }}>
                            {req.pickupPoint} → {req.dropoffPoint}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
                {pendingRequests.length > 0 && (
                  <Text style={{ color: M.stone400, fontSize: 12 }}>
                    +{pendingRequests.length} pending request{pendingRequests.length > 1 ? "s" : ""}
                  </Text>
                )}
              </View>

              {!isDriver && myRequest?.status !== "declined" && (
                myRequest ? (
                  <Btn disabled style={{ height: 50 }} onPress={() => {}}>
                    {myRequest.status === "approved" ? "Joined" : "Request Pending"}
                  </Btn>
                ) : (
                  <Btn onPress={() => { a.closeRideDetail(); a.openJoinRequest(ride); }} style={{ height: 50 }}>
                    Request to Join
                  </Btn>
                )
              )}
            </View>
          );
        })() : null}
      </Sheet>

      {/* Join Request */}
      <Sheet open={!!a.selectedRideToJoin} title="Request to Join" onClose={a.closeJoinRequest}>
        {a.selectedRideToJoin
          ? (() => {
              const ride = a.selectedRideToJoin!;
              const seatsTotal = ride.seatsTotal || 4;
              const seatsTaken = seatsTotal - (ride.seatsLeft ?? seatsTotal - 1);
              const costPerRider = ride.approximateCost ? ride.approximateCost / seatsTotal : 0;
              const isCreator = ride.driverId === a.currentUser.id;
              const driver = findUser(a.users, ride.driverId);
              return (
                <View style={{ gap: 16 }}>
                  {/* Route */}
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18 }}>{ride.origin}</Text>
                    <Text style={{ color: M.amber500, fontSize: 13, fontWeight: "900" }}>↓</Text>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18 }}>{ride.destination}</Text>
                    <Text style={{ color: M.stone500, fontSize: 13, marginTop: 4 }}>
                      {ride.date}{ride.departureTime ? ` · ${ride.departureTime}` : ""}
                      {ride.vehicle ? `  ·  ${ride.vehicle}` : ""}
                    </Text>
                  </View>

                  {/* Cost */}
                  {costPerRider > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: M.amber50, padding: 12, borderRadius: RADIUS.md }}>
                      <Text style={{ color: M.stone600, fontSize: 13 }}>Estimated cost per person</Text>
                      <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 16 }}>{driverMoney(costPerRider)}</Text>
                    </View>
                  )}

                  {/* Seats bar */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontWeight: "700", color: M.stone500, fontSize: 12 }}>
                      {seatsTotal - seatsTaken} of {seatsTotal} seats left
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {Array.from({ length: seatsTotal }).map((_, i) => (
                        <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < seatsTaken ? M.amber400 : M.stone100 }} />
                      ))}
                    </View>
                  </View>

                  {/* Driver row — only show to creator so they can reassign */}
                  {isCreator && (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
                      <View>
                        <Text style={{ fontWeight: "700", color: M.stone500, fontSize: 11 }}>DRIVER</Text>
                        <Text style={{ fontWeight: "900", color: M.stone950, marginTop: 2 }}>{driver.name || "You"}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const others = a.users.filter((u) => u.id !== ride.driverId);
                          if (others.length === 0) { alert("No other members to assign as driver."); return; }
                          Alert.alert(
                            "Reassign Driver",
                            "Choose a new driver",
                            [
                              ...others.map((u) => ({
                                text: u.name,
                                onPress: () => a.reassignDriver(ride.id, u.id),
                              })),
                              { text: "Cancel", style: "cancel" as const },
                            ]
                          );
                        }}
                      >
                        <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 13 }}>Reassign</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Pickup / dropoff — only show to non-creator */}
                  {!isCreator && (
                    <View style={{ gap: 8 }}>
                      <TextInput
                        placeholder="Your pickup point"
                        placeholderTextColor={M.stone400}
                        value={a.pickupPoint}
                        onChangeText={a.setPickupPoint}
                        style={textInputStyle()}
                      />
                      <TextInput
                        placeholder="Your drop-off point"
                        placeholderTextColor={M.stone400}
                        value={a.dropoffPoint}
                        onChangeText={a.setDropoffPoint}
                        style={textInputStyle()}
                      />
                      <Btn onPress={a.submitJoinRequest} style={{ height: 50 }}>
                        Send Request
                      </Btn>
                    </View>
                  )}
                </View>
              );
            })()
          : null}
      </Sheet>

      {/* Create Group */}
      <Sheet
        open={a.createGroupOpen}
        title="Create group"
        onClose={() => a.setCreateGroupOpen(false)}
      >
        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="Group name"
            placeholderTextColor={M.stone400}
            value={a.groupDraftName}
            onChangeText={a.setGroupDraftName}
            style={textInputStyle()}
          />
          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={M.stone400}
            value={a.groupDraftDesc}
            onChangeText={a.setGroupDraftDesc}
            style={textInputStyle()}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              placeholder="Add by email"
              placeholderTextColor={M.stone400}
              value={a.groupDraftEmail}
              onChangeText={a.setGroupDraftEmail}
              autoCapitalize="none"
              style={[textInputStyle(), { flex: 1 }]}
            />
            <Btn onPress={a.addGroupMemberByEmail}>Add</Btn>
          </View>

          <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>Select people</Text>
          {a.connections.map((u) => (
            <TouchableOpacity
              key={u.id}
              onPress={() => a.toggleGroupDraftMember(u.id)}
              style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Image source={{ uri: u.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950 }}>
                    {u.name}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 11 }}>{u.email}</Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: a.groupDraftSelected[u.id] ? M.amber300 : M.stone200,
                    backgroundColor: a.groupDraftSelected[u.id] ? M.amber400 : M.white,
                  }}
                />
              </View>
            </TouchableOpacity>
          ))}

          <Btn onPress={a.confirmCreateGroup}>Create group</Btn>
        </View>
      </Sheet>

      {/* Cancel Confirm */}
      <Sheet
        open={!!a.cancelTarget}
        title="Cancel ride?"
        onClose={() => a.setCancelTarget(null)}
      >
        {a.cancelTarget ? (
          <View style={{ gap: 16 }}>
            <Text style={{ color: M.stone700, fontWeight: "600", fontSize: 13 }}>
              Are you sure you want to cancel this ride? The driver will be notified.
            </Text>
            <ShellCard>
              <View style={{ padding: 16 }}>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 16 }}>
                  {a.cancelTarget.route}
                </Text>
                <Text style={{ color: M.stone500, fontSize: 13, marginTop: 4 }}>
                  {a.cancelTarget.date}, {a.cancelTarget.time}
                </Text>
              </View>
            </ShellCard>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Btn onPress={() => a.setCancelTarget(null)} variant="muted" style={{ flex: 1 }}>
                Keep
              </Btn>
              <Btn onPress={a.confirmCancelUpcomingTrip} variant="dark" style={{ flex: 1 }}>
                Cancel ride
              </Btn>
            </View>
          </View>
        ) : null}
      </Sheet>

      {/* Request Details */}
      <Sheet
        open={!!a.selectedRequestId}
        title="Request details"
        onClose={() => a.setSelectedRequestId(null)}
      >
        {(() => {
          const req = a.rideRequests.find((r) => r.id === a.selectedRequestId);
          if (!req) return null;
          const ride = a.rides.find((r) => r.id === req.rideId) || null;
          const driver = ride ? findUser(a.users, ride.driverId) : null;
          return (
            <View style={{ gap: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "900", color: M.amber500, fontSize: 13 }}>Ride Request</Text>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18 }}>
                    {ride ? (
                      <>
                        {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                      </>
                    ) : (
                      "Ride"
                    )}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 10, marginTop: 4 }}>
                    Created: {req.createdAt}
                  </Text>
                </View>
                <StatusPill status={req.status} />
              </View>

              {driver ? (
                <View
                  style={{ backgroundColor: M.amber50, padding: 12, borderRadius: RADIUS.md }}
                >
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>Driver</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <Image source={{ uri: driver.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                    <View>
                      <Text style={{ fontWeight: "900", color: M.stone950 }}>{driver.name}</Text>
                      <RatingBadge
                        label="Driver"
                        rating={driver.driverRating}
                        reviewCount={driver.driverReviewCount}
                        ridesCompleted={driver.driverRidesCompleted}
                        compact
                      />
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={{ gap: 6 }}>
                <Text style={{ color: M.stone600, fontSize: 13 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>Pickup:</Text> {req.pickupPoint}
                </Text>
                <Text style={{ color: M.stone600, fontSize: 13 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>Drop-off:</Text> {req.dropoffPoint}
                </Text>
                {Number.isFinite(Number(req.maxCost)) ? (
                  <Text style={{ color: M.stone600, fontSize: 13 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>Max cost:</Text>{" "}
                    {driverMoney(Number(req.maxCost))}
                    {Number.isFinite(Number(req.maxCostLow)) && Number.isFinite(Number(req.maxCostHigh)) ? (
                      <Text style={{ color: M.stone500, fontWeight: "600", fontSize: 11 }}>
                        {`  (range ${driverMoney(Number(req.maxCostLow))} – ${driverMoney(Number(req.maxCostHigh))})`}
                      </Text>
                    ) : null}
                  </Text>
                ) : null}
                {ride ? (
                  <Text style={{ color: M.stone600, fontSize: 13 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>When:</Text> {ride.date},{" "}
                    {ride.departureTime}
                  </Text>
                ) : null}
              </View>

              {req.status === "pending" ? (
                <View style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
                  <Text style={{ color: M.stone600, fontWeight: "600", fontSize: 11 }}>
                    Waiting for driver approval.
                  </Text>
                </View>
              ) : null}
              {req.status === "declined" ? (
                <View style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
                  <Text style={{ color: M.stone600, fontWeight: "600", fontSize: 11 }}>
                    This request was declined by the driver.
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })()}
      </Sheet>

      {/* Ride Details (confirmation) */}
      <Sheet
        open={!!a.selectedConfirmationId}
        title="Ride Details"
        onClose={() => a.setSelectedConfirmationId(null)}
      >
        {(() => {
          const conf = a.confirmedRides.find((c) => c.id === a.selectedConfirmationId);
          if (!conf) return null;
          const ride = a.rides.find((r) => r.id === conf.rideId);
          if (!ride) return null;
          const driver = findUser(a.users, ride.driverId);
          const passengersInOrder = (ride.passengerIds || [])
            .filter((id) => id && id !== ride.driverId)
            .map((id) => findUser(a.users, id));
          const passengerCapacity = Math.max((ride.seatsTotal || 0) - 1, 0);
          const occupied = Math.min(passengersInOrder.length, passengerCapacity);

          return (
            <View style={{ gap: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "900", color: M.amber500, fontSize: 13 }}>Ride Confirmed</Text>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18 }}>
                    {ride.origin} <Text style={{ color: M.amber500 }}>→</Text> {ride.destination}
                  </Text>
                </View>
                <StatusPill status={conf.status === "confirmed" ? "approved" : conf.status} />
              </View>

              <View style={{ backgroundColor: M.amber50, padding: 12, borderRadius: RADIUS.md }}>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>Driver</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <Image source={{ uri: driver.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                  <View>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>{driver.name}</Text>
                    <RatingBadge
                      label="Driver"
                      rating={driver.driverRating}
                      reviewCount={driver.driverReviewCount}
                      ridesCompleted={driver.driverRidesCompleted}
                      compact
                    />
                  </View>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ color: M.stone600, fontSize: 13 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>Vehicle:</Text> {ride.vehicle}
                </Text>
                <Text style={{ color: M.stone600, fontSize: 13 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>Pickup:</Text> {conf.pickupPoint}
                </Text>
                <Text style={{ color: M.stone600, fontSize: 13 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>Drop-off:</Text> {conf.dropoffPoint}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: M.stone600, fontSize: 13 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>Seats occupied:</Text> {occupied} /{" "}
                    {passengerCapacity}
                  </Text>
                  {passengersInOrder.length > 0 ? <OrderedAvatarRow people={passengersInOrder} /> : null}
                </View>
              </View>

              {conf.status === "confirmed" ? (
                <>
                  <Btn onPress={() => a.cancelConfirmedRide(conf.id)} variant="muted">
                    Cancel Ride
                  </Btn>

                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <MessageCircle color={M.amber500} size={16} />
                      <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>Message Driver</Text>
                    </View>
                    <QuickMessageButtons onMessage={(m) => a.sendQuickMessage(conf.id, m)} />
                    {conf.messages.length > 0 ? (
                      <View style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md, gap: 4 }}>
                        {conf.messages.map((msg, i) => (
                          <Text key={`${msg}-${i}`} style={{ color: M.stone500, fontSize: 11 }}>
                            {msg}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>

                  <View style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md, gap: 8 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                      Did this ride happen?
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Btn
                        onPress={() => a.markRideCompletion(conf.id, true)}
                        style={{ flex: 1, backgroundColor: M.emerald500 }}
                      >
                        Yes
                      </Btn>
                      <Btn
                        onPress={() => a.markRideCompletion(conf.id, false)}
                        variant="muted"
                        style={{ flex: 1 }}
                      >
                        No
                      </Btn>
                    </View>
                  </View>
                </>
              ) : null}

              {conf.completed && !conf.reviewSubmitted ? (
                <ReviewBox
                  reviewRating={a.reviewRating}
                  reviewComment={a.reviewComment}
                  onRatingChange={a.setReviewRating}
                  onCommentChange={a.setReviewComment}
                  onSubmit={() => a.submitDriverReview(conf.id)}
                />
              ) : null}

              {conf.reviewSubmitted ? (
                <View
                  style={{
                    backgroundColor: M.emerald50,
                    padding: 12,
                    borderRadius: RADIUS.md,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 color={M.emerald700} size={16} />
                  <Text style={{ fontWeight: "900", color: M.emerald700, fontSize: 13 }}>Review submitted.</Text>
                </View>
              ) : null}

              {conf.status === "cancelled" ? (
                <View
                  style={{
                    backgroundColor: M.stone50,
                    padding: 12,
                    borderRadius: RADIUS.md,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <XCircle color={M.stone500} size={16} />
                  <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 13 }}>
                    This ride is no longer active.
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })()}
      </Sheet>

      {/* Driver Trip Details */}
      <Sheet
        open={!!a.driverTripDetailsId}
        title="Driver Trip Details"
        onClose={() => a.setDriverTripDetailsId(null)}
      >
        {(() => {
          const trip = a.driverTrips.find((t) => t.id === a.driverTripDetailsId);
          if (!trip) return null;
          return (
            <View style={{ gap: 16 }}>
              <ShellCard>
                <View style={{ padding: 16, gap: 8 }}>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 16 }}>
                    {trip.origin} <Text style={{ color: M.amber500 }}>→</Text> {trip.destination}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 13 }}>{trip.carLabel}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    {[
                      { label: "distance", value: `${Number(trip.distanceKm).toFixed(1)} km` },
                      { label: "total", value: driverMoney(trip.totalCost) },
                      { label: "you save", value: driverMoney(trip.driverSavings) },
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
                        <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 10 }}>{tile.label}</Text>
                        <Text
                          style={{ fontWeight: "900", color: M.stone950, fontSize: 13, marginTop: 4 }}
                        >
                          {tile.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ color: M.stone500, fontSize: 11 }}>
                    each rider pays: {driverMoney(trip.perRiderCost)}
                  </Text>
                </View>
              </ShellCard>

              <View style={{ gap: 8 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                >
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>riders</Text>
                  <Text style={{ fontWeight: "600", color: M.stone500, fontSize: 11 }}>tap to rate</Text>
                </View>

                {(trip.recipientIds || []).map((rid) => {
                  const u = findUser(a.users, rid);
                  if (!u) return null;
                  const paid = !!trip.paidById?.[rid];
                  const rating = trip.ratingsById?.[rid];
                  return (
                    <ShellCard key={rid}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
                        <TouchableOpacity
                          onPress={() => a.openDriverRate(trip.id, rid)}
                          style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
                        >
                          <Image source={{ uri: u.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950 }}>
                              {u.name}
                            </Text>
                            <Text style={{ color: M.stone500, fontSize: 11, marginTop: 4 }}>
                              {paid ? "paid" : "not paid"}
                              {rating ? ` · rated ${rating.rating}/5` : ""}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => a.toggleDriverPaid(trip.id, rid)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 999,
                            backgroundColor: paid ? M.emerald50 : M.stone100,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "900",
                              fontSize: 11,
                              color: paid ? M.emerald700 : M.stone600,
                            }}
                          >
                            {paid ? "paid" : "mark paid"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ShellCard>
                  );
                })}
              </View>
            </View>
          );
        })()}
      </Sheet>

      {/* Driver: Add Car (basic) */}
      <Sheet
        open={a.driverAddCarOpen}
        title="Add car"
        onClose={() => a.setDriverAddCarOpen(false)}
      >
        {a.driverCarLoading ? (
          <ActivityIndicator color={M.amber500} style={{ padding: 24 }} />
        ) : (
          <View style={{ gap: 12 }}>
            <CarSearchField
              label="make"
              placeholder="Search car make"
              value={a.driverCarDraft.make}
              options={a.driverMakeOptions}
              resetToken={a.driverAddCarOpen}
              onCommit={a.selectDriverCarMake}
            />

            <CarSearchField
              label="model"
              placeholder={a.driverCarDraft.make ? "Search model" : "Choose a make first"}
              value={a.driverCarDraft.model}
              options={a.driverModelOptions}
              loading={a.driverModelsLoading}
              disabled={!a.driverCarDraft.make}
              resetToken={a.driverAddCarOpen}
              onCommit={a.selectDriverCarModel}
            />

            <CarSearchField
              label="year"
              placeholder={a.driverCarDraft.model ? "Search year" : "Choose a model first"}
              value={a.driverCarDraft.year}
              options={a.driverYearOptions}
              loading={a.driverYearsLoading}
              disabled={!a.driverCarDraft.model}
              resetToken={a.driverAddCarOpen}
              onCommit={a.selectDriverCarYear}
            />

            <Btn
              onPress={a.confirmDriverCarBasic}
              disabled={!a.driverCarDraft.make || !a.driverCarDraft.model || !a.driverCarDraft.year}
            >
              confirm
            </Btn>
          </View>
        )}
      </Sheet>

      {/* Driver: Fuel */}
      <Sheet
        open={a.driverFuelOpen}
        title="Fuel consumption"
        onClose={() => a.setDriverFuelOpen(false)}
      >
        <View style={{ gap: 12 }}>
          <ShellCard>
            <View style={{ padding: 16, gap: 4 }}>
              <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                {a.driverCarDraft.year} {a.driverCarDraft.make} {a.driverCarDraft.model}
              </Text>
              <Text style={{ color: M.stone500, fontSize: 11 }}>
                estimated consumption (L/100km) — edit if needed
              </Text>
            </View>
          </ShellCard>
          <TextInput
            placeholder="e.g., 7.5"
            placeholderTextColor={M.stone400}
            keyboardType="decimal-pad"
            value={a.driverCarConsumption}
            onChangeText={a.setDriverCarConsumption}
            style={textInputStyle()}
          />
          <Btn onPress={a.confirmDriverCarFuel}>done</Btn>
        </View>
      </Sheet>

      {/* Driver: Sync Contacts */}
      <Sheet
        open={a.driverSyncOpen}
        title="Sync contacts"
        onClose={() => a.setDriverSyncOpen(false)}
      >
        <View style={{ gap: 12 }}>
          <Text style={{ color: M.stone500, fontSize: 11 }}>
            select contacts who already have an account (demo list)
          </Text>
          {a.driverContacts.map((u) => (
            <TouchableOpacity
              key={u.id}
              onPress={() => a.toggleDriverSyncUser(u.id)}
              style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Image source={{ uri: u.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950 }}>
                    {u.name}
                  </Text>
                  <Text style={{ color: M.stone500, fontSize: 11 }}>{u.email}</Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: a.driverSyncSelected[u.id] ? M.amber300 : M.stone200,
                    backgroundColor: a.driverSyncSelected[u.id] ? M.amber400 : M.white,
                  }}
                />
              </View>
            </TouchableOpacity>
          ))}
          <Btn onPress={a.confirmDriverSyncContacts}>confirm</Btn>
        </View>
      </Sheet>

      {/* Driver: Create Folder */}
      <Sheet
        open={a.driverFolderOpen}
        title="Create folder"
        onClose={() => a.setDriverFolderOpen(false)}
      >
        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="folder name (e.g., office buddies)"
            placeholderTextColor={M.stone400}
            value={a.driverFolderName}
            onChangeText={a.setDriverFolderName}
            style={textInputStyle()}
          />
          <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>select friends</Text>
          {a.driverFriends.length === 0 ? (
            <ShellCard>
              <View style={{ padding: 16 }}>
                <Text style={{ color: M.stone500, fontSize: 13 }}>sync contacts first</Text>
              </View>
            </ShellCard>
          ) : (
            a.driverFriends.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => a.toggleDriverFolderMember(f.id)}
                style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Image source={{ uri: f.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>{f.name}</Text>
                    <Text style={{ color: M.stone500, fontSize: 11 }}>{f.email}</Text>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: a.driverFolderSelected[f.id] ? M.amber300 : M.stone200,
                      backgroundColor: a.driverFolderSelected[f.id] ? M.amber400 : M.white,
                    }}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
          <Btn onPress={a.confirmDriverCreateFolder}>create</Btn>
        </View>
      </Sheet>

      {/* Driver: Create Trip Wizard */}
      <Sheet
        open={a.driverCreateTripOpen}
        title={
          a.driverTripStep === 1
            ? "Trip details"
            : a.driverTripStep === 2
            ? "Choose car"
            : "Choose riders"
        }
        onClose={() => a.setDriverCreateTripOpen(false)}
      >
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: a.driverTripStep >= step ? M.amber400 : M.stone200,
                  }}
                />
              ))}
            </View>
            {a.driverTripStep > 1 ? (
              <TouchableOpacity
                onPress={a.driverTripBack}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <ChevronLeft color={M.amber600} size={16} />
                <Text style={{ fontWeight: "900", color: M.amber600, fontSize: 13 }}>back</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {a.driverTripStep === 1 ? (
            <View style={{ gap: 12 }}>
              <TextInput
                placeholder="point a (origin)"
                placeholderTextColor={M.stone400}
                value={a.driverTripForm.origin}
                onChangeText={(v) => a.setDriverTripForm((p) => ({ ...p, origin: v }))}
                style={textInputStyle()}
              />
              <TextInput
                placeholder="point b (destination)"
                placeholderTextColor={M.stone400}
                value={a.driverTripForm.destination}
                onChangeText={(v) => a.setDriverTripForm((p) => ({ ...p, destination: v }))}
                style={textInputStyle()}
              />
              <View style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}>
                <Text style={{ color: M.stone500, fontSize: 11 }}>
                  distance estimate:{" "}
                  <Text style={{ fontWeight: "900", color: M.stone950 }}>
                    {driverEstimateDistanceKm(a.driverTripForm.origin, a.driverTripForm.destination).toFixed(1)}{" "}
                    km
                  </Text>
                </Text>
              </View>
              <Btn onPress={a.driverTripNext}>next</Btn>
            </View>
          ) : null}

          {a.driverTripStep === 2 ? (
            <View style={{ gap: 12 }}>
              {a.driverCars.length === 0 ? (
                <ShellCard>
                  <View style={{ padding: 16, gap: 8 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>No cars yet</Text>
                    <Text style={{ color: M.stone500, fontSize: 11 }}>
                      Add a car first, then come back.
                    </Text>
                    <Btn
                      onPress={() => {
                        a.setDriverCreateTripOpen(false);
                        a.openDriverAddCar();
                      }}
                    >
                      add car
                    </Btn>
                  </View>
                </ShellCard>
              ) : (
                <>
                  {a.driverCars.map((car) => (
                    <TouchableOpacity
                      key={car.id}
                      onPress={() => a.setDriverTripForm((p) => ({ ...p, carId: car.id }))}
                      style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "900", color: M.stone950 }}>
                            {car.year} {car.make} {car.model}
                          </Text>
                          <Text style={{ color: M.stone500, fontSize: 11, marginTop: 4 }}>
                            {car.consumptionLPer100.toFixed(1)} L/100km
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: a.driverTripForm.carId === car.id ? M.amber300 : M.stone200,
                            backgroundColor: a.driverTripForm.carId === car.id ? M.amber400 : M.white,
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Btn onPress={a.driverTripNext}>next</Btn>
                </>
              )}
            </View>
          ) : null}

          {a.driverTripStep === 3 ? (
            <View style={{ gap: 12 }}>
              {a.driverFriends.length === 0 ? (
                <ShellCard>
                  <View style={{ padding: 16, gap: 8 }}>
                    <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>No friends yet</Text>
                    <Text style={{ color: M.stone500, fontSize: 11 }}>
                      Sync contacts from Profile, then come back.
                    </Text>
                    <Btn
                      onPress={() => {
                        a.setDriverCreateTripOpen(false);
                        a.setDriverSyncOpen(true);
                      }}
                    >
                      go to sync contacts
                    </Btn>
                  </View>
                </ShellCard>
              ) : (
                <>
                  {a.driverFriendFolders.length > 0 ? (
                    <View style={{ gap: 8 }}>
                      <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>
                        pick a folder (optional)
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {a.driverFriendFolders.map((f) => (
                          <TouchableOpacity
                            key={f.id}
                            onPress={() => a.applyDriverFolderMembers(f.id)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 999,
                              backgroundColor: a.driverTripForm.folderId === f.id ? M.amber400 : M.stone100,
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: "900",
                                fontSize: 11,
                                color: a.driverTripForm.folderId === f.id ? M.white : M.stone600,
                              }}
                            >
                              {f.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : null}

                  <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>add people</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {a.driverTripForm.recipientIds.map((id) => {
                      const u = findUser(a.users, id);
                      return u ? (
                        <DriverChip
                          key={id}
                          label={u.name}
                          onRemove={() => a.removeDriverRecipient(id)}
                        />
                      ) : null;
                    })}
                  </View>

                  <View style={{ position: "relative" }}>
                    <TextInput
                      placeholder="type a name"
                      placeholderTextColor={M.stone400}
                      value={a.driverTripForm.recipientQuery}
                      onChangeText={(v) => a.setDriverTripForm((p) => ({ ...p, recipientQuery: v }))}
                      style={[textInputStyle({ paddingRight: 40 })]}
                    />
                    <Search color={M.amber500} size={18} style={{ position: "absolute", right: 14, top: 14 }} />
                  </View>

                  <View style={{ gap: 8 }}>
                    {a.driverFriends
                      .filter((f) => {
                        const q = a.driverTripForm.recipientQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          f.name.toLowerCase().includes(q) ||
                          f.email.toLowerCase().includes(q)
                        );
                      })
                      .filter((f) => !a.driverTripForm.recipientIds.includes(f.id))
                      .slice(0, 6)
                      .map((f) => (
                        <TouchableOpacity
                          key={f.id}
                          onPress={() => a.addDriverRecipient(f.id)}
                          style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <Image
                              source={{ uri: f.avatar }}
                              style={{ width: 40, height: 40, borderRadius: 20 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: "900", color: M.stone950 }}>{f.name}</Text>
                              <Text style={{ color: M.stone500, fontSize: 11 }}>{f.email}</Text>
                            </View>
                            <Plus color={M.amber500} size={20} />
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>

                  <Btn onPress={a.driverTripNext}>preview + send</Btn>
                </>
              )}
            </View>
          ) : null}
        </View>
      </Sheet>

      {/* Driver Trip Preview */}
      <Sheet
        open={a.driverTripPreviewOpen}
        title="Trip summary"
        onClose={() => a.setDriverTripPreviewOpen(false)}
      >
        {a.driverTripPreview ? (
          <View style={{ gap: 16 }}>
            <ShellCard>
              <View style={{ padding: 16, gap: 4 }}>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 16 }}>
                  {a.driverTripPreview.origin} <Text style={{ color: M.amber500 }}>→</Text>{" "}
                  {a.driverTripPreview.destination}
                </Text>
                <Text style={{ color: M.stone500, fontSize: 13 }}>
                  {a.driverTripPreview.car
                    ? `${a.driverTripPreview.car.year} ${a.driverTripPreview.car.make} ${a.driverTripPreview.car.model}`
                    : ""}
                </Text>
              </View>
            </ShellCard>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <ShellCard style={{ flex: 1 }}>
                <View style={{ padding: 16 }}>
                  <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 11 }}>distance</Text>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 20, marginTop: 4 }}>
                    {a.driverTripPreview.distanceKm.toFixed(1)} km
                  </Text>
                </View>
              </ShellCard>
              <ShellCard style={{ flex: 1 }}>
                <View style={{ padding: 16 }}>
                  <Text style={{ fontWeight: "900", color: M.stone500, fontSize: 11 }}>total cost</Text>
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 20, marginTop: 4 }}>
                    {driverMoney(a.driverTripPreview.totalCost)}
                  </Text>
                </View>
              </ShellCard>
            </View>

            <ShellCard>
              <View style={{ padding: 16, gap: 4 }}>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                  rider cost (each)
                </Text>
                <Text style={{ fontWeight: "900", color: M.amber500, fontSize: 30 }}>
                  {driverMoney(a.driverTripPreview.perRider)}
                </Text>
                <Text style={{ color: M.stone500, fontSize: 11 }}>
                  you save {driverMoney(a.driverTripPreview.driverSavings)} if everyone accepts and pays
                </Text>
              </View>
            </ShellCard>

            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>sending to</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {a.driverTripPreview.recipientIds.map((id) => {
                  const u = findUser(a.users, id);
                  return u ? <DriverChip key={id} label={u.name} /> : null;
                })}
              </View>
            </View>

            <Btn onPress={a.confirmDriverTripSend}>confirm + send requests</Btn>
          </View>
        ) : null}
      </Sheet>

      {/* Driver Rate Rider */}
      <Sheet
        open={a.driverRateOpen}
        title="Rate rider"
        onClose={() => a.setDriverRateOpen(false)}
      >
        <View style={{ gap: 12 }}>
          <DriverStars value={a.driverRateValue} onChange={a.setDriverRateValue} />
          <TextInput
            placeholder="optional comment"
            placeholderTextColor={M.stone400}
            value={a.driverRateComment}
            onChangeText={a.setDriverRateComment}
            multiline
            style={textInputStyle({ minHeight: 90 })}
          />
          <Btn onPress={a.confirmDriverRate}>submit</Btn>
        </View>
      </Sheet>

      {/* Posted Ride Detail */}
      <Sheet
        open={!!a.selectedPostedRide}
        title="My Ride"
        onClose={a.closePostedRideDetail}
      >
        {a.selectedPostedRide ? <PostedRideDetailContent /> : null}
      </Sheet>
    </>
  );
}
