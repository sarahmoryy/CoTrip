import LocationEditor from "@/components/trips/LocationEditor";
import SimplifiedTripForm from "@/components/trips/SimplifiedTripForm";
import TripCard from "@/components/trips/TripCard";
import TripConfirmation from "@/components/trips/TripConfirmation";
import TripDetails from "@/components/trips/TripDetails";
import { MapPin, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CarService } from "../../store/carService";
import { setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";
import { TripService } from "../../store/tripService";
import { addTrip, deleteTrip, setTrips, Trip, updateTrip } from "../../store/tripSlice";

export default function Trips() {
  const dispatch = useDispatch();
  const cars = useSelector((state: RootState) => state.car.cars || []);
  const trips = useSelector((state: RootState) => state.trip.trips || []);
  console.log("Trips data:", trips); // Debug log
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

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
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTrip = async () => {
    try {
      if (pendingTrip) {
        setIsCalculating(true);
        const newTrip = await TripService.create({ ...pendingTrip, id: crypto.randomUUID() });
        dispatch(addTrip(newTrip));
        setShowConfirmation(false);
        setPendingTrip(null);
        loadData();
      }
    } catch (error) {
      console.error("Error saving trip:", error);
    } finally {
      setIsCalculating(false);
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

  const handleSaveLocationNames = async (locationData: { from_location_name: string; to_location_name: string }) => {
    try {
      if (selectedTrip) {
        await TripService.update(selectedTrip.id, locationData);
        dispatch(updateTrip({ id: selectedTrip.id, tripData: locationData }));
        setShowLocationEditor(false);
        setSelectedTrip(null);
        loadData();
      }
    } catch (error) {
      console.error("Error updating location names:", error);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await TripService.delete(tripId);
      dispatch(deleteTrip(tripId));
      loadData();
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

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

      {/* Modals */}
      {showForm && (
        <Modal visible={showForm} animationType="slide">
          <SimplifiedTripForm
            cars={cars}
            onCalculate={(tripData: Trip) => {
              setIsCalculating(true);
              setPendingTrip(tripData);
              setShowForm(false);
              setShowConfirmation(true);
            }}
            onCancel={() => setShowForm(false)}
            isCalculating={isCalculating}
          />
        </Modal>
      )}

      {showConfirmation && pendingTrip && (
        <Modal visible={showConfirmation} animationType="slide">
          <TripConfirmation
            trip={pendingTrip}
            onConfirm={handleConfirmTrip}
            onCancel={() => setShowConfirmation(false)}
          />
        </Modal>
      )}

      {showTripDetails && selectedTrip && (
        <Modal visible={showTripDetails} animationType="slide">
          <TripDetails
            trip={selectedTrip}
            cars={cars}
            onEditLocations={handleEditLocations}
            onClose={() => {
              setShowTripDetails(false);
              setSelectedTrip(null);
            }}
          />
        </Modal>
      )}

      {showLocationEditor && selectedTrip && (
        <Modal visible={showLocationEditor} animationType="slide">
          <LocationEditor
            trip={selectedTrip}
            onSave={handleSaveLocationNames}
            onCancel={() => {
              setShowLocationEditor(false);
              setSelectedTrip(null);
            }}
          />
        </Modal>
      )}
    </ScrollView>
  );
}