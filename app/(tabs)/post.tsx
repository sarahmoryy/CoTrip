import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Car, Clock, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import AutocompleteInput from "../../components/AutoComplete";
import { useApp } from "../../components/mockup/AppContext";
import type { MCarOwned } from "../../components/mockup/data";
import { DRIVER_GAS_PRICE_PER_L } from "../../components/mockup/data";
import { M, RADIUS } from "../../components/mockup/theme";
import { Btn, MockScreen, RoundIcon, ShellCard } from "../../components/mockup/ui";

function driverCarToOwned(car: {
  id: string; make: string; model: string; year: string; consumptionLPer100: number;
}): MCarOwned {
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

  const {
    driverCars,
    openDriverAddCar,
    selectedCarForRide,
    newRideForm,
    setNewRideForm,
    postRideOffer,
    closeRideCreation,
    selectCarForPosting,
  } = useApp();

  // Step 1: no car selected — show car list or prompt to add one
  if (!selectedCarForRide) {
    return (
      <MockScreen>
        <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>Post a Ride</Text>
        <Text style={{ color: M.stone500, fontSize: 14 }}>Choose which car you're driving.</Text>

        {driverCars.length === 0 ? (
          <ShellCard>
            <View style={{ padding: 24, alignItems: "center", gap: 12 }}>
              <Car size={36} color={M.stone300} />
              <Text style={{ fontWeight: "900", color: M.stone600, fontSize: 15 }}>No cars yet</Text>
              <Text style={{ color: M.stone400, fontSize: 13, textAlign: "center" }}>
                Add your car first so riders know what to expect.
              </Text>
              <Btn onPress={openDriverAddCar} style={{ width: "100%", height: 48 }}>
                <Plus color={M.white} size={18} />
                <Text style={{ color: M.white, fontWeight: "900" }}>Add My Car</Text>
              </Btn>
            </View>
          </ShellCard>
        ) : (
          <View style={{ gap: 10 }}>
            {driverCars.map((car) => {
              const owned = driverCarToOwned(car);
              return (
                <TouchableOpacity key={owned.id} activeOpacity={0.85} onPress={() => selectCarForPosting(owned)}>
                  <ShellCard>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
                      <RoundIcon>
                        <Car color={M.white} size={24} />
                      </RoundIcon>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 15 }}>{owned.name}</Text>
                        <Text style={{ color: M.stone500, fontSize: 12, marginTop: 2 }}>
                          {owned.seats} seats · ${owned.costPerKm.toFixed(2)}/km
                        </Text>
                      </View>
                    </View>
                  </ShellCard>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={openDriverAddCar} style={{ alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ color: M.amber600, fontWeight: "900", fontSize: 13 }}>+ Add another car</Text>
            </TouchableOpacity>
          </View>
        )}
      </MockScreen>
    );
  }

  // Step 2: car selected — fill in the ride details
  return (
    <MockScreen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: M.stone950 }}>New Ride</Text>
        <TouchableOpacity onPress={closeRideCreation}>
          <Text style={{ color: M.stone400, fontWeight: "700", fontSize: 13 }}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Selected car pill */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: M.amber50, paddingHorizontal: 12, paddingVertical: 10, borderRadius: RADIUS.md }}>
        <Car size={16} color={M.amber500} />
        <Text style={{ fontWeight: "900", color: M.stone950, fontSize: 13 }}>{selectedCarForRide.name}</Text>
        <TouchableOpacity onPress={closeRideCreation} style={{ marginLeft: "auto" }}>
          <Text style={{ color: M.amber600, fontSize: 12, fontWeight: "700" }}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Route */}
      <View style={{ gap: 10 }}>
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
      </View>

      {/* Date + Time */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={() => { setShowTimePicker(false); setShowDatePicker((v) => !v); }}
          style={{
            flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
            borderWidth: 1, borderColor: showDatePicker ? M.amber400 : M.stone200,
            borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 13,
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
            flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
            borderWidth: 1, borderColor: showTimePicker ? M.amber400 : M.stone200,
            borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 13,
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

      <Btn onPress={postRideOffer} style={{ height: 52, marginTop: 4 }}>
        Post Ride
      </Btn>
    </MockScreen>
  );
}
