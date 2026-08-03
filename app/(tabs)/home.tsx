import { MapPin, Search } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { M, RADIUS } from "../../components/mockup/theme";
import { MockScreen, RideCard, ShellCard } from "../../components/mockup/ui";

export default function HomeScreen() {
  const { rides, openRideDetail, currentUser } = useApp();
  const [query, setQuery] = useState("");

  const availableRides = rides.filter((r) => {
    if ((r.seatsLeft ?? 0) <= 0) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  });

  return (
    <MockScreen>
      <View style={{ paddingTop: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>
          Find a Ride
        </Text>
        <Text style={{ marginTop: 2, fontSize: 14, color: M.stone500 }}>
          Browse rides near you and request to join.
        </Text>
      </View>

      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: M.stone100,
          borderRadius: RADIUS.lg,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <Search size={16} color={M.stone400} />
        <TextInput
          placeholder="Search by city, campus, address..."
          placeholderTextColor={M.stone400}
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, fontSize: 14, color: M.stone950 }}
          autoCapitalize="none"
        />
      </View>

      {/* Rides feed */}
      {availableRides.length === 0 ? (
        <ShellCard>
          <View style={{ padding: 32, alignItems: "center", gap: 8 }}>
            <MapPin size={32} color={M.stone300} />
            <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 15 }}>
              {query ? "No rides match your search" : "No rides available yet"}
            </Text>
            <Text style={{ color: M.stone400, fontSize: 13, textAlign: "center" }}>
              {query
                ? "Try a different city or address"
                : "Tap + to post your own ride and invite others"}
            </Text>
          </View>
        </ShellCard>
      ) : (
        <View style={{ gap: 12 }}>
          {availableRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onOpenDetail={openRideDetail}
              isOwn={ride.driverId === currentUser.id}
            />
          ))}
        </View>
      )}
    </MockScreen>
  );
}
