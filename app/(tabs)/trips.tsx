import { MapPin, Plus } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import LocationEditor from "@/components/trips/LocationEditor";
import SimplifiedTripForm from "@/components/trips/SimplifiedTripForm";
import TripCard from "@/components/trips/TripCard";
import TripConfirmation from "@/components/trips/TripConfirmation";
import TripDetails from "@/components/trips/TripDetails";

import { CarService } from "../../store/carService";
import { setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";
import { TripService } from "../../store/tripService";
import { addTrip, deleteTrip, setTrips, Trip, updateTrip } from "../../store/tripSlice";

export default function Trips() {
  const dispatch = useDispatch();
  const cars = useSelector((s: RootState) => s.car.cars || []);
  const trips = useSelector((s: RootState) => s.trip.trips || []);

  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Track what we just created so we can delete it if user cancels
  const justCreatedTripIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const tripsData = await TripService.list();
      const carsData = await CarService.list();
      dispatch(setCars(carsData));
      dispatch(setTrips(tripsData));
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTripCardClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };

  const handleEditLocations = () => {
    setShowTripDetails(false);
    setShowLocationEditor(true);
  };

  // (Legacy) only used if LocationEditor returned names-only in older versions.
  const handleSaveLocationNames = async (locationData: {
    from_location_name: string;
    to_location_name: string;
  }) => {
    try {
      if (selectedTrip) {
        await TripService.update(selectedTrip.id, locationData);
        dispatch(updateTrip({ id: selectedTrip.id, tripData: locationData }));
        setShowLocationEditor(false);
        setSelectedTrip(null);
        loadData();
      }
    } catch (e) {
      console.error("Error updating location names:", e);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await TripService.delete(tripId);
      dispatch(deleteTrip(tripId));
      loadData();
    } catch (e) {
      console.error("Error deleting trip:", e);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // ✅ Precompute selected car for the editor (no consts inside JSX)
  const selectedCar =
    selectedTrip && selectedTrip.car_id
      ? cars.find((c) => c.id === selectedTrip.car_id)
      : undefined;

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-10">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-3xl font-bold text-white mt-11">Your Trips</Text>
          <Text className="text-gray-400 text-xl mt-1">{trips.length} trips planned</Text>
        </View>
        <Pressable
          onPress={() => setShowForm(true)}
          className="flex-row items-center bg-main px-3 py-2 rounded-lg mt-10"
        >
          <Plus color="white" size={16} />
          <Text className="text-white text-xl ml-1 font-medium">New Trip</Text>
        </Pressable>
      </View>

      {trips.length === 0 ? (
        <View className="bg-gray-900 p-8 rounded-xl shadow-md items-center">
          <MapPin size={48} color="gray" />
          <Text className="text-white text-2xl font-semibold mt-4 mb-3">No trips yet</Text>
          <Text className="text-gray-500 text-center text-xl mb-4">
            Start planning your first carpooling trip
          </Text>
          <Pressable
            onPress={() => setShowForm(true)}
            className="flex-row items-center bg-main px-3 py-2 rounded-lg"
          >
            <Plus size={16} color="white" />
            <Text className="text-white text-xl ml-2">Plan Your First Trip</Text>
          </Pressable>
        </View>
      ) : (
        <View className="space-y-4 mt-4">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              cars={cars}
              onClick={() => handleTripCardClick(trip)}
              onDelete={handleDeleteTrip}
            />
          ))}
        </View>
      )}

      {/* Create -> save immediately -> open confirmation */}
      {showForm && (
        <SimplifiedTripForm
          cars={cars}
          onCalculate={async (incoming: Trip) => {
            try {
              setIsCalculating(true);
              // Save to DB FIRST; create() should return the saved Trip inc. id
              const saved = await TripService.create(incoming);

              // Show on page
              dispatch(addTrip(saved));
              justCreatedTripIdRef.current = saved.id;

              // Open confirmation with the saved trip
              setPendingTrip(saved);
              setShowForm(false);
              setShowConfirmation(true);
            } catch (e) {
              console.error("Error creating trip:", e);
            } finally {
              setIsCalculating(false);
            }
          }}
          onCancel={() => setShowForm(false)}
          isCalculating={isCalculating}
        />
      )}

      {showConfirmation && pendingTrip && (
        <TripConfirmation
          trip={pendingTrip}
          onConfirm={async (updated) => {
            try {
              setIsCalculating(true);
              const s = Number.isFinite(updated.savings as number) ? (updated.savings as number) : 0;

              // 1) Persist to Firestore
              await TripService.update(updated.id, { savings: s });

              // 2) Update Redux immediately
              dispatch(updateTrip({ id: updated.id, tripData: { savings: s } }));
            } catch (e) {
              console.error("Error confirming trip:", e);
            } finally {
              setIsCalculating(false);
              setShowConfirmation(false);
              setPendingTrip(null);
              justCreatedTripIdRef.current = null;
            }
          }}
          onCancel={async () => {
            // User changed mind — delete the just-created trip
            try {
              setIsCalculating(true);
              const id = justCreatedTripIdRef.current || pendingTrip.id;
              await TripService.delete(id);
              dispatch(deleteTrip(id));
            } catch (e) {
              console.error("Error rolling back new trip:", e);
            } finally {
              setIsCalculating(false);
              setShowConfirmation(false);
              setPendingTrip(null);
              justCreatedTripIdRef.current = null;
            }
          }}
        />
      )}

      {showTripDetails && selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          cars={cars}
          onEditLocations={() => {
            setShowTripDetails(false);
            setShowLocationEditor(true);
          }}
          onClose={() => {
            setShowTripDetails(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {/* ✅ Location editor now saves via dispatch internally (no onSave prop) */}
      {showLocationEditor && selectedTrip && selectedCar && (
        <LocationEditor
          trip={selectedTrip}
          car={selectedCar}
          carList={cars}
          passengers={selectedTrip.passengers ?? "1"}
          onCancel={() => {
            setShowLocationEditor(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {/* If no car found for the selected trip, show a gentle notice */}
      {showLocationEditor && selectedTrip && !selectedCar && (
        <View className="p-4">
          <Text className="text-white">
            This trip has no car selected. Please select a car for this trip before editing locations.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
