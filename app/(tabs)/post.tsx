import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Car, Clock, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import AutocompleteInput from "../../components/AutoComplete";
import { useApp } from "../../components/mockup/AppContext";
import type { MCarOwned } from "../../components/mockup/data";
import { DRIVER_GAS_PRICE_PER_L } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import {
  Btn,
  MockScreen,
  RoundIcon,
  SectionHeader,
  ShellCard,
} from "../../components/mockup/ui";

function driverCarToOwned(car: { id: string; make: string; model: string; year: string; consumptionLPer100: number }): MCarOwned {
  return {
    id: car.id,
    name: `${car.year} ${car.make} ${car.model}`,
    seats: 4,
    costPerKm: (car.consumptionLPer100 * DRIVER_GAS_PRICE_PER_L) / 100,
  };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

export default function PostRideScreen() {
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [rideTypeOpen, setRideTypeOpen] = useState(false);

  const {
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

      {!selectedCarForRide && (
        <>
          <Btn
            onPress={() => setRideTypeOpen((v) => !v)}
            style={{ height: 56, gap: 12 }}
          >
            <Plus color={M.white} size={22} />
            <Text style={{ color: M.white, fontWeight: "900", fontSize: 15 }}>Create Ride</Text>
          </Btn>

          {rideTypeOpen && (
            <ShellCard>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setRideTypeOpen(false); openCarPicker(); }}
                style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: M.stone100 }}
              >
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}>Post a Ride</Text>
                <Text style={{ marginTop: 2, color: M.stone500, fontSize: 12 }}>
                  Find riders for your route
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setRideTypeOpen(false); openDriverTripWizard(); }}
                style={{ padding: 16 }}
              >
                <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 14 }}>Split Costs</Text>
                <Text style={{ marginTop: 2, color: M.stone500, fontSize: 12 }}>
                  Share gas expenses with friends
                </Text>
              </TouchableOpacity>
            </ShellCard>
          )}
        </>
      )}

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

            <AutocompleteInput
              placeholder="Departure location"
              initialText={newRideForm.origin}
              onSelected={(v) => setNewRideForm({ ...newRideForm, origin: v.description })}
              onTextChange={(v) => setNewRideForm({ ...newRideForm, origin: v })}
            />
            <AutocompleteInput
              placeholder="Destination"
              initialText={newRideForm.destination}
              onSelected={(v) => setNewRideForm({ ...newRideForm, destination: v.description })}
              onTextChange={(v) => setNewRideForm({ ...newRideForm, destination: v })}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => { setShowTimePicker(false); setShowDatePicker((v) => !v); }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: showDatePicker ? M.amber400 : M.stone200,
                  borderRadius: RADIUS.md,
                  paddingHorizontal: 12,
                  paddingVertical: 13,
                  backgroundColor: M.surface,
                }}
              >
                <Calendar size={16} color={M.amber500} />
                <Text style={{ color: newRideForm.date ? M.stone950 : M.stone400, fontSize: 14 }}>
                  {newRideForm.date || "Date"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setShowDatePicker(false); setShowTimePicker((v) => !v); }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: showTimePicker ? M.amber400 : M.stone200,
                  borderRadius: RADIUS.md,
                  paddingHorizontal: 12,
                  paddingVertical: 13,
                  backgroundColor: M.surface,
                }}
              >
                <Clock size={16} color={M.amber500} />
                <Text style={{ color: newRideForm.time ? M.stone950 : M.stone400, fontSize: 14 }}>
                  {newRideForm.time || "Time"}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (selected) {
                    setPickerDate(selected);
                    setNewRideForm({ ...newRideForm, date: formatDate(selected) });
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") setShowTimePicker(false);
                  if (selected) {
                    setPickerDate(selected);
                    setNewRideForm({ ...newRideForm, time: formatTime(selected) });
                  }
                }}
              />
            )}

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

      <SectionHeader icon={<Car color={M.amber500} size={22} />} title="Post with My Car" />
      {driverCars.length === 0 ? (
        <ShellCard>
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: M.stone500, fontSize: 13 }}>
              Add a car above to start posting rides.
            </Text>
          </View>
        </ShellCard>
      ) : (
        <View style={{ gap: 12 }}>
          {driverCars.map((car) => {
            const carOwned = driverCarToOwned(car);
            return (
              <TouchableOpacity key={carOwned.id} onPress={() => selectCarForPosting(carOwned)}>
                <ShellCard>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16 }}>
                    <RoundIcon>
                      <Car color={M.white} size={28} />
                    </RoundIcon>
                    <View>
                      <Text style={{ fontWeight: "700", color: M.stone950 }}>{carOwned.name}</Text>
                      <Text style={{ color: M.stone500, fontSize: 13 }}>
                        {carOwned.seats} seats · ${carOwned.costPerKm.toFixed(2)}/km estimate
                      </Text>
                    </View>
                  </View>
                </ShellCard>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </MockScreen>
  );
}
