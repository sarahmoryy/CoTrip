import { toMillis } from "@/assets/utils/conversion";
import { Car as CarIcon, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CarCard from "../../components/cars/CarCard";
import CarForm from "../../components/cars/CarForm";
import ConsumptionConfirmation from "../../components/cars/ConsumptionConfirmation";
import { EmptyState } from "../../components/ui/primitives";
import { C, FONT } from "../../components/ui/theme";
import { CarService } from "../../store/carService";
import { Car, addCar, setCars } from "../../store/carSlice";
import { RootState } from "../../store/store";

const toNumber = (n: any) =>
  typeof n === "number" ? n : typeof n === "string" ? Number(n) || 0 : 0;
const normalizeCar = (c: any): Car => ({
  ...c,
  year: toNumber(c?.year),
  fuel_efficiency: toNumber(c?.fuel_efficiency),
  consumption_l_100km:
    c?.consumption_l_100km == null ? null : toNumber(c.consumption_l_100km),
  createdAt: toMillis(c?.createdAt),
  updatedAt: toMillis(c?.updatedAt),
});

export default function CarsScreen() {
  const [showForm, setShowForm] = useState(false);
  const [showConsumption, setShowConsumption] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [pendingCar, setPendingCar] = useState<Car | null>(null);
  const [consumption, setConsumption] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cars = useSelector((state: RootState) => state.car.cars || []);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await CarService.list("-createdAt");
      dispatch(setCars((data || []).map(normalizeCar)));
    } catch (e) {
      console.error("Error loading cars:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCar = async (carData: Car) => {
    setIsSaving(true);
    try {
      const finalData = {
        ...carData,
        fuel_efficiency: carData.fuel_efficiency || 25,
      };
      let newCar: Car;
      if (editingCar) {
        await CarService.update(editingCar.id, finalData);
        newCar = normalizeCar({ ...editingCar, ...finalData });
      } else {
        const created = await CarService.create(finalData);
        newCar = normalizeCar(created);
        dispatch(addCar(newCar));
      }
      const fetchedConsumption = await CarService.fetchConsumption(
        newCar.make,
        newCar.model,
        newCar.year,
      );
      if (fetchedConsumption != null) {
        setPendingCar(newCar);
        setConsumption(fetchedConsumption);
        setShowConsumption(true);
        setShowForm(false);
      } else {
        setShowForm(false);
        setEditingCar(null);
        loadCars();
      }
    } catch (e) {
      console.error("Error saving car:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingTop: 64,
          paddingBottom: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View>
          <Text style={FONT.pageTitle}>Your Cars</Text>
          <Text style={[FONT.bodyMuted, { marginTop: 4 }]}>
            {cars.length} vehicle{cars.length !== 1 ? "s" : ""} registered
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.greenDark,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: C.radius,
            gap: 6,
          }}
        >
          <Plus color="#fff" size={16} />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Add Car
          </Text>
        </TouchableOpacity>
      </View>

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
      {showConsumption && pendingCar && consumption != null && (
        <ConsumptionConfirmation
          car={pendingCar}
          consumption={consumption}
          onConfirm={async (updated) => {
            try {
              setIsSaving(true);
              await CarService.update(pendingCar.id, {
                ...updated,
                consumption_l_100km: consumption,
              });
              setShowConsumption(false);
              setPendingCar(null);
              setConsumption(null);
              setEditingCar(null);
              loadCars();
            } catch (e) {
              console.error(e);
            } finally {
              setIsSaving(false);
            }
          }}
          onReturn={() => {
            setShowConsumption(false);
            setShowForm(true);
            setPendingCar(null);
            setConsumption(null);
          }}
        />
      )}

      {cars.length > 0 ? (
        <View style={{ gap: 12 }}>
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onEdit={(c) => {
                setEditingCar(c);
                setShowForm(true);
              }}
              onDelete={async (id) => {
                await CarService.delete(id);
                loadCars();
              }}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon={<CarIcon color={C.green} size={28} />}
          title="No cars registered"
          subtitle="Add your first vehicle to start calculating trip costs."
          action="Add your first car"
          onAction={() => setShowForm(true)}
        />
      )}
    </ScrollView>
  );
}
