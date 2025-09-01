import { Car as CarIcon, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import CarCard from "../../components/cars/CarCard";
import CarForm from "../../components/cars/CarForm";
import ConsumptionConfirmation from "../../components/cars/ConsumptionConfirmation";
import { CarService } from "../../store/carService";
import { Car, addCar, setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";

export default function CarsScreen() {
  const [showForm, setShowForm] = useState(false);
  const [showConsumption, setShowConsumption] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [pendingCar, setPendingCar] = useState<Car | null>(null);
  const [consumption, setConsumption] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const cars = useSelector((state: RootState) => state.car.cars || []);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const carsData = await CarService.list("-created_date");
      dispatch(setCars(carsData));
    } catch (error) {
      console.error("Error loading cars:", error);
      setError(error instanceof Error ? error.message : "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCar = async (carData: Car) => {
    setIsSaving(true);
    try {
      const finalCarData = {
        ...carData,
        fuel_efficiency: carData.fuel_efficiency || 25,
      };
      console.log("Final Car Data:", finalCarData); // Debug log

      let newCar: Car;
      if (editingCar) {
        await CarService.update(editingCar.id, finalCarData);
        newCar = { ...editingCar, ...finalCarData };
      } else {
        newCar = await CarService.create({ ...finalCarData, id: uuidv4() });
        dispatch(addCar(newCar)); // Add to Redux store immediately
      }
      console.log("New Car:", newCar); // Debug log

      // Fetch consumption data from API
      const fetchedConsumption = await CarService.fetchConsumption(
        newCar.make,
        newCar.model,
        newCar.year
      );
      console.log("Fetched Consumption:", fetchedConsumption); // Debug log

      if (fetchedConsumption) {
        setPendingCar(newCar);
        setConsumption(fetchedConsumption);
        setShowConsumption(true);
        setShowForm(false); // Close the CarForm modal after saving
        console.log("State after setting:", { pendingCar, consumption, showConsumption, showForm }); // Debug log
      } else {
        setShowForm(false);
        setEditingCar(null);
        loadCars(); // Refresh list if no consumption
      }
    } catch (error) {
      console.error("Error saving car:", error);
      setError(error instanceof Error ? error.message : "Failed to save car or fetch consumption");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmConsumption = async (updatedCar: Car) => {
    try {
      setIsSaving(true);
      if (pendingCar && consumption) {
        let newCar: Car;
        if (editingCar) {
          await CarService.update(editingCar.id, updatedCar);
          newCar = { ...editingCar, ...updatedCar };
        } else {
          newCar = await CarService.create({ ...updatedCar, id: uuidv4() });
          dispatch(addCar(newCar)); // Add to Redux store
        }

        setShowConsumption(false);
        setPendingCar(null);
        setConsumption(null);
        setEditingCar(null);
        loadCars(); // Refresh list after confirmation
      }
    } catch (error) {
      console.error("Error confirming consumption:", error);
      setError(error instanceof Error ? error.message : "Failed to confirm consumption");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      await CarService.delete(carId);
      loadCars();
    } catch (error) {
      console.error("Error deleting car:", error);
      setError(error instanceof Error ? error.message : "Failed to delete car");
    }
  };

  const handleReturnToForm = () => {
    setShowConsumption(false);
    setShowForm(true);
    setPendingCar(null);
    setConsumption(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-400 text-xl">{error}</Text>
        <Pressable
          className="bg-green-400 px-4 py-2 rounded-lg mt-4"
          onPress={loadCars}
        >
          <Text className="text-white text-lg">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 pt-10 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-bold text-white mt-11">Your Cars</Text>
          <Text className="text-gray-400 text-xl mt-1">{cars.length} vehicles registered</Text>
        </View>
        <Pressable
          className="bg-main px-3 py-2 rounded-lg flex-row items-center mt-10"
          onPress={() => setShowForm(true)}
        >
          <Plus size={20} color="white" />
          <Text className="text-white ml-1 text-xl font-medium">Add Car</Text>
        </Pressable>
      </View>

      {/* Car Form Modal */}
      {showForm && (
        <CarForm
          car={editingCar}
          onSave={handleSaveCar}
          onCancel={() => {
            setShowForm(false);
            setEditingCar(null);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Consumption Confirmation Modal */}
      {showConsumption && pendingCar && consumption && (
        <ConsumptionConfirmation
          car={pendingCar}
          consumption={consumption}
          onConfirm={handleConfirmConsumption}
          onReturn={handleReturnToForm}
        />
      )}

      {/* Car List */}
      {cars.length > 0 ? (
        cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onEdit={handleEditCar}
            onDelete={handleDeleteCar}
          />
        ))
      ) : (
        <View className="bg-gray-900 p-8 rounded-xl items-center shadow-sm">
          <CarIcon size={48} color="#9ca3af" />
          <Text className="text-2xl text-white font-semibold mt-4 mb-3">No cars registered</Text>
          <Text className="text-gray-400 mb-4 text-xl text-center">
            Add your first vehicle to start carpooling
          </Text>
          <Pressable
            onPress={() => setShowForm(true)}
            className="bg-main px-4 py-2 rounded-lg flex-row items-center"
          >
            <Plus size={20} color="white" />
            <Text className="text-white text-xl ml-2">Add Your First Car</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}