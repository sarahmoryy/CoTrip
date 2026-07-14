import { Car, Plus, Star } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApp } from "../../components/mockup/AppContext";
import { carsOwned } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import {
  Btn,
  MockScreen,
  RoundIcon,
  SectionHeader,
  ShellCard,
  textInputStyle,
} from "../../components/mockup/ui";

export default function PostRideScreen() {
  const {
    pinnedPostRides,
    driverCars,
    groups,
    openCarPicker,
    openDriverAddCar,
    openDriverTripWizard,
    selectedCarForRide,
    newRideForm,
    setNewRideForm,
    ridePostPublic,
    setRidePostPublic,
    ridePostGroupSelected,
    toggleRidePostGroup,
    postRideOffer,
    closeRideCreation,
    selectCarForPosting,
  } = useApp();

  return (
    <MockScreen>
      <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>Post Ride</Text>

      <Btn onPress={openCarPicker} style={{ height: 56, gap: 12 }}>
        <Plus color={M.white} size={22} />
        <Text style={{ color: M.white, fontWeight: "900", fontSize: 15 }}>Create New Ride</Text>
      </Btn>

      <Btn onPress={openDriverTripWizard} variant="secondary" style={{ height: 50, gap: 8 }}>
        <Plus color={M.amber600} size={18} />
        <Text style={{ color: M.amber600, fontWeight: "900", fontSize: 13 }}>
          Create Driver Trip (cost split)
        </Text>
      </Btn>

      {selectedCarForRide ? (
        <ShellCard>
          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: M.stone500, fontWeight: "600", fontSize: 13 }}>Creating ride with</Text>
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 18 }}>
                  {selectedCarForRide.name}
                </Text>
                <Text style={{ color: M.stone500, fontSize: 13 }}>
                  {selectedCarForRide.seats} seats · ${selectedCarForRide.costPerKm.toFixed(2)}/km estimate
                </Text>
              </View>
              <TouchableOpacity onPress={closeRideCreation}>
                <Text style={{ color: M.stone400, fontWeight: "900", fontSize: 13 }}>Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Departure location"
              placeholderTextColor={M.stone400}
              value={newRideForm.origin}
              onChangeText={(v) => setNewRideForm({ ...newRideForm, origin: v })}
              style={textInputStyle()}
            />
            <TextInput
              placeholder="Destination"
              placeholderTextColor={M.stone400}
              value={newRideForm.destination}
              onChangeText={(v) => setNewRideForm({ ...newRideForm, destination: v })}
              style={textInputStyle()}
            />
            <TextInput
              placeholder="Departure time"
              placeholderTextColor={M.stone400}
              value={newRideForm.time}
              onChangeText={(v) => setNewRideForm({ ...newRideForm, time: v })}
              style={textInputStyle()}
            />

            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 11 }}>Post to</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setRidePostPublic(!ridePostPublic)}
                style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View>
                    <Text style={{ fontWeight: "900", color: M.stone950 }}>No group (available to all)</Text>
                    <Text style={{ color: M.stone500, fontSize: 11, marginTop: 2 }}>
                      Shows under Ungrouped Rides
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: ridePostPublic ? M.amber300 : M.stone200,
                      backgroundColor: ridePostPublic ? M.amber400 : M.white,
                    }}
                  />
                </View>
              </TouchableOpacity>

              <Text style={{ fontWeight: "600", color: M.stone500, fontSize: 11 }}>
                Also post to groups (optional)
              </Text>

              {groups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  activeOpacity={0.9}
                  onPress={() => toggleRidePostGroup(g.id)}
                  style={{ backgroundColor: M.stone50, padding: 12, borderRadius: RADIUS.md }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontWeight: "900", color: M.stone950 }}>
                        {g.name}
                      </Text>
                      <Text style={{ color: M.stone500, fontSize: 11, marginTop: 2 }}>
                        {(g.memberIds || []).length} members
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: ridePostGroupSelected[g.id] ? M.amber300 : M.stone200,
                        backgroundColor: ridePostGroupSelected[g.id] ? M.amber400 : M.white,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Btn onPress={postRideOffer} style={{ height: 50 }}>
              Post Ride
            </Btn>
          </View>
        </ShellCard>
      ) : null}

      <SectionHeader icon={<Star color={M.amber500} size={22} />} title="Pinned Rides" />
      <View style={{ gap: 12 }}>
        {pinnedPostRides.map((ride) => (
          <ShellCard key={ride.id}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900", color: M.stone950 }}>{ride.route}</Text>
                <Text style={{ color: M.stone500, fontSize: 13, marginTop: 4 }}>{ride.schedule}</Text>
              </View>
              <Btn style={{ paddingHorizontal: 14, paddingVertical: 8 }}>Repost</Btn>
            </View>
          </ShellCard>
        ))}
      </View>

      <SectionHeader icon={<Car color={M.amber500} size={22} />} title="Cars Owned" />

      <ShellCard>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>My cars</Text>
            <Btn onPress={openDriverAddCar} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              Add
            </Btn>
          </View>
          {driverCars.length === 0 ? (
            <Text style={{ color: M.stone500, fontSize: 11 }}>
              No cars yet. Add one to compute driver trip costs.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {driverCars.map((car) => (
                <View
                  key={car.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: M.stone50,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>
                    {car.year} {car.make} {car.model}
                  </Text>
                  <Text style={{ fontWeight: "600", color: M.stone500, fontSize: 11 }}>
                    {car.consumptionLPer100.toFixed(1)} L/100km
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ShellCard>

      <View style={{ gap: 12 }}>
        {carsOwned.map((car) => (
          <TouchableOpacity key={car.id} onPress={() => selectCarForPosting(car)}>
            <ShellCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16 }}>
                <RoundIcon>
                  <Car color={M.white} size={28} />
                </RoundIcon>
                <View>
                  <Text style={{ fontWeight: "700", color: M.stone950 }}>{car.name}</Text>
                  <Text style={{ color: M.stone500, fontSize: 13 }}>
                    {car.seats} seats · ${car.costPerKm.toFixed(2)}/km estimate
                  </Text>
                </View>
              </View>
            </ShellCard>
          </TouchableOpacity>
        ))}
      </View>
    </MockScreen>
  );
}
