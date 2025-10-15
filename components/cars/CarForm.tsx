import { Picker } from "@react-native-picker/picker";
import { Car as CarIcon, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Car } from "../../store/carSlice";
import {
  CAR_MAKES,
  CAR_MODELS,
  CAR_YEARS,
  VEHICLES,
  VehicleEntry,
} from "../../vehicleLists";

interface CarFormProps {
  car: Car | null;
  onSave: (carData: Car) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function CarForm({
  car,
  onSave,
  onCancel,
  isSaving,
}: CarFormProps) {
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year?.toString() || "",
    license_plate: car?.license_plate || "",
    consumption_l_100km: car?.consumption_l_100km?.toString() || "",
  });

  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [showMakePicker, setShowMakePicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // temp states for selection before confirmation
  const [tempMake, setTempMake] = useState(formData.make || "default");
  const [tempModel, setTempModel] = useState(formData.model || "default");
  const [tempYear, setTempYear] = useState(formData.year || "default");

  // Update models when make changes
  useEffect(() => {
    if (!formData.make) {
      setModels([]);
      setFormData((prev) => ({ ...prev, model: "", year: "" }));
      return;
    }
    const makeModels = CAR_MODELS[formData.make] ?? [];
    setModels(makeModels);
    setFormData((prev) => ({ ...prev, model: "", year: "" }));
    setYears([]);
  }, [formData.make]);

  // Update years when model changes
  useEffect(() => {
    if (!formData.make || !formData.model) {
      setYears([]);
      setFormData((prev) => ({ ...prev, year: "" }));
      return;
    }
    const modelYears: number[] = CAR_YEARS[formData.make]?.[formData.model] ?? [];
    setYears(modelYears);
    setFormData((prev) => ({ ...prev, year: "" }));
  }, [formData.model]);

  // Update consumption when year changes
  useEffect(() => {
    if (!formData.make || !formData.model || !formData.year) return;

    const entry: VehicleEntry | undefined =
      VEHICLES[formData.make]?.[formData.model]?.find(
        (v) => v.year === parseInt(formData.year)
      );

    if (entry) {
      setFormData((prev) => ({
        ...prev,
        consumption_l_100km: entry.combinedLPer100km.toString(),
      }));
    }
  }, [formData.year]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const carData: Car = {
      id: car?.id || "",
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year) || 0,
      license_plate: formData.license_plate || undefined,
      consumption_l_100km: formData.consumption_l_100km
        ? parseFloat(formData.consumption_l_100km)
        : undefined,
      fuel_efficiency: car?.fuel_efficiency,
    };
    onSave(carData);
  };

  const renderBottomPicker = (
    visible: boolean,
    onClose: () => void,
    tempValue: string,
    setTempValue: (value: string) => void,
    onConfirm: () => void,
    items: { label: string; value: string }[],
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={tempValue}
            onValueChange={setTempValue}
            style={styles.picker}
          >
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                color={item.value === "default" ? "#9CA3AF" : "#FFF"}
              />
            ))}
          </Picker>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal transparent={false} visible={true} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <CarIcon color="#10B981" size={26} />
              <Text style={styles.headerTitle}>{car ? "Edit Car" : "Add new car"}</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X color="#9CA3AF" size={26} />
            </TouchableOpacity>
          </View>

          {/* Car Brand */}
          <Text style={styles.label}>Car Brand</Text>
          <TouchableOpacity
            style={styles.pickerWrapper}
            onPress={() => {
              setTempMake(formData.make || "default");
              setShowMakePicker(true);
            }}
          >
            <Text style={{ color: formData.make ? "#FFF" : "#9CA3AF", fontSize: 16 }}>
              {formData.make || "Select car make"}
            </Text>
          </TouchableOpacity>

          {/* Model */}
          <Text style={styles.label}>Model</Text>
          <TouchableOpacity
            style={[styles.pickerWrapper, !formData.make && styles.pickerDisabled]}
            disabled={!formData.make}
            onPress={() => {
              setTempModel(formData.model || "default");
              setShowModelPicker(true);
            }}
          >
            <Text style={{ color: formData.model ? "#FFF" : "#9CA3AF", fontSize: 16 }}>
              {formData.model || "Select model"}
            </Text>
          </TouchableOpacity>

          {/* Year */}
          <Text style={styles.label}>Year</Text>
          <TouchableOpacity
            style={[styles.pickerWrapper, !formData.model && styles.pickerDisabled]}
            disabled={!formData.model}
            onPress={() => {
              setTempYear(formData.year || "default");
              setShowYearPicker(true);
            }}
          >
            <Text style={{ color: formData.year ? "#FFF" : "#9CA3AF", fontSize: 16 }}>
              {formData.year || "Select year"}
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.button,
              (!formData.make || !formData.model || !formData.year) && styles.buttonDisabled,
            ]}
            disabled={isSaving || !formData.make || !formData.model || !formData.year}
          >
            <Text style={styles.buttonText}>{isSaving ? "Loading..." : "Add"}</Text>
          </TouchableOpacity>
        </View>

        {/* Picker Modals */}
        {renderBottomPicker(
          showMakePicker,
          () => setShowMakePicker(false),
          tempMake,
          setTempMake,
          () => {
            handleChange("make", tempMake === "default" ? "" : tempMake);
            setShowMakePicker(false);
          },
          [
            { label: "Select car make", value: "default" },
            ...CAR_MAKES.map((m) => ({ label: m, value: m })),
          ],
          "Select Car Brand"
        )}

        {renderBottomPicker(
          showModelPicker,
          () => setShowModelPicker(false),
          tempModel,
          setTempModel,
          () => {
            handleChange("model", tempModel === "default" ? "" : tempModel);
            setShowModelPicker(false);
          },
          [
            { label: "Select model", value: "default" },
            ...models.map((m) => ({ label: m, value: m })),
          ],
          "Select Model"
        )}

        {renderBottomPicker(
          showYearPicker,
          () => setShowYearPicker(false),
          tempYear,
          setTempYear,
          () => {
            handleChange("year", tempYear === "default" ? "" : tempYear);
            setShowYearPicker(false);
          },
          [
            { label: "Select year", value: "default" },
            ...years.map((y) => ({ label: y.toString(), value: y.toString() })),
          ],
          "Select Year"
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 16,
  },
  formContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "700", marginLeft: 8 },
  label: { color: "#FFF", fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  pickerWrapper: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  pickerDisabled: {
    opacity: 0.4,
  },
  picker: {
    color: "#FFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#6B7280",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bottomSheet: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: { color: "#9CA3AF", fontSize: 16 },
  doneText: { color: "#10B981", fontSize: 16 },
});
