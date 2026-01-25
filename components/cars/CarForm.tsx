import { Car as CarIcon, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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

type SearchType = "make" | "model" | "year" | null;

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

  const [searchType, setSearchType] = useState<SearchType>(null);
  const [query, setQuery] = useState("");

  /* ---------------------------------- */
  /* SEARCH DATA SOURCES */
  /* ---------------------------------- */

  const modelOptions = useMemo(
    () => (formData.make ? CAR_MODELS[formData.make] ?? [] : []),
    [formData.make]
  );

  const yearOptions = useMemo(
    () =>
      formData.make && formData.model
        ? (CAR_YEARS[formData.make]?.[formData.model] ?? []).map(String)
        : [],
    [formData.make, formData.model]
  );

  /* ---------------------------------- */
  /* SMART SEARCH (RANKED) */
  /* ---------------------------------- */

  const suggestions = useMemo(() => {
    if (!searchType || !query) return [];

    const list =
      searchType === "make"
        ? CAR_MAKES
        : searchType === "model"
        ? modelOptions
        : searchType === "year"
        ? yearOptions
        : [];

    const q = query.toLowerCase();

    const startsWith: string[] = [];
    const wordStartsWith: string[] = [];
    const includes: string[] = [];

    for (const item of list) {
      const lower = item.toLowerCase();

      if (lower.startsWith(q)) {
        startsWith.push(item);
      } else if (lower.split(" ").some(word => word.startsWith(q))) {
        wordStartsWith.push(item);
      } else if (lower.includes(q)) {
        includes.push(item);
      }
    }

    return [...startsWith, ...wordStartsWith, ...includes].slice(0, 5);
  }, [searchType, query, modelOptions, yearOptions]);

  /* ---------------------------------- */
  /* AUTO CONSUMPTION */
  /* ---------------------------------- */

  useEffect(() => {
    if (!formData.make || !formData.model || !formData.year) return;

    const entry: VehicleEntry | undefined =
      VEHICLES[formData.make]?.[formData.model]?.find(
        (v) => v.year === Number(formData.year)
      );

    if (entry) {
      setFormData((prev) => ({
        ...prev,
        consumption_l_100km: entry.combinedLPer100km.toString(),
      }));
    }
  }, [formData.year]);

  /* ---------------------------------- */
  /* HELPERS */
  /* ---------------------------------- */

  const openSearch = (type: SearchType) => {
    setQuery("");
    setSearchType(type);
  };

  const selectValue = (value: string) => {
    if (searchType === "make") {
      setFormData({
        make: value,
        model: "",
        year: "",
        license_plate: "",
        consumption_l_100km: "",
      });
    }
    if (searchType === "model") {
      setFormData((prev) => ({ ...prev, model: value, year: "" }));
    }
    if (searchType === "year") {
      setFormData((prev) => ({ ...prev, year: value }));
    }

    Keyboard.dismiss();
    setSearchType(null);
  };

  const handleSubmit = () => {
    const carData: Car = {
      id: car?.id || "",
      make: formData.make,
      model: formData.model,
      year: Number(formData.year),
      license_plate: formData.license_plate || undefined,
      consumption_l_100km: Number(formData.consumption_l_100km) || undefined,
      fuel_efficiency: car?.fuel_efficiency,
    };
    onSave(carData);
  };

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */

  return (
    <Modal visible animationType="slide">
      <View style={styles.container}>
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <CarIcon size={24} color="#10B981" />
              <Text style={styles.headerTitle}>
                {car ? "Edit Car" : "Add new car"}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Make */}
          <Text style={styles.label}>Car Brand</Text>
          <TouchableOpacity style={styles.input} onPress={() => openSearch("make")}>
            <Text style={formData.make ? styles.value : styles.placeholder}>
              {formData.make || "Search car brand"}
            </Text>
          </TouchableOpacity>

          {/* Model */}
          <Text style={styles.label}>Model</Text>
          <TouchableOpacity
            style={[styles.input, !formData.make && styles.disabled]}
            disabled={!formData.make}
            onPress={() => openSearch("model")}
          >
            <Text style={formData.model ? styles.value : styles.placeholder}>
              {formData.model || "Search model"}
            </Text>
          </TouchableOpacity>

          {/* Year */}
          <Text style={styles.label}>Year</Text>
          <TouchableOpacity
            style={[styles.input, !formData.model && styles.disabled]}
            disabled={!formData.model}
            onPress={() => openSearch("year")}
          >
            <Text style={formData.year ? styles.value : styles.placeholder}>
              {formData.year || "Search year"}
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.button,
              (!formData.make || !formData.model || !formData.year) &&
                styles.buttonDisabled,
            ]}
            disabled={isSaving || !formData.make || !formData.model || !formData.year}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH MODAL */}
      <Modal transparent visible={!!searchType} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.searchContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSearchType(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Search</Text>
                <TouchableOpacity onPress={() => setSearchType(null)}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus
                placeholder="Type to search..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                blurOnSubmit={false}
              />

              {suggestions.length === 0 ? (
                <Text style={styles.noResults}>No results found</Text>
              ) : (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectValue(item)}
                    >
                      <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
}

/* ---------------------------------- */
/* STYLES */
/* ---------------------------------- */

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
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },

  label: { color: "#FFF", fontSize: 16, fontWeight: "600", marginTop: 16 },
  input: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
  },
  placeholder: { color: "#9CA3AF", fontSize: 16 },
  value: { color: "#FFF", fontSize: 16 },
  disabled: { opacity: 0.4 },

  button: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    marginTop: 24,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#6B7280" },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    width: "92%",
    maxHeight: "60%",
    backgroundColor: "#0F1724",
    borderRadius: 18,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  modalTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  cancelText: { color: "#9CA3AF" },
  doneText: { color: "#10B981" },

  searchInput: {
    backgroundColor: "#111827",
    margin: 16,
    borderRadius: 10,
    padding: 14,
    color: "#FFF",
    fontSize: 16,
  },
  suggestionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  suggestionText: { color: "#FFF", fontSize: 16 },
  noResults: {
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: 24,
  },
});
