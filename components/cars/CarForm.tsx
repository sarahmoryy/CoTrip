import { Car as CarIcon, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { Btn } from "../ui/primitives";
import { useTheme } from "../ui/theme";

interface Props {
  car: Car | null;
  onSave: (data: Car) => void;
  onCancel: () => void;
  isSaving: boolean;
}
type SearchType = "make" | "model" | "year" | null;

export default function CarForm({ car, onSave, onCancel, isSaving }: Props) {
  const { C } = useTheme();
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year?.toString() || "",
    license_plate: car?.license_plate || "",
    consumption_l_100km: car?.consumption_l_100km?.toString() || "",
  });
  const [searchType, setSearchType] = useState<SearchType>(null);
  const [query, setQuery] = useState("");

  const modelOptions = useMemo(
    () => (formData.make ? (CAR_MODELS[formData.make] ?? []) : []),
    [formData.make],
  );
  const yearOptions = useMemo(
    () =>
      formData.make && formData.model
        ? (CAR_YEARS[formData.make]?.[formData.model] ?? []).map(String)
        : [],
    [formData.make, formData.model],
  );

  const suggestions = useMemo(() => {
    if (!searchType || !query) return [];
    const list =
      searchType === "make"
        ? CAR_MAKES
        : searchType === "model"
          ? modelOptions
          : yearOptions;
    const q = query.toLowerCase();
    const starts: string[] = [];
    const wordStarts: string[] = [];
    const includes: string[] = [];
    for (const item of list) {
      const l = item.toLowerCase();
      if (l.startsWith(q)) starts.push(item);
      else if (l.split(" ").some((w) => w.startsWith(q))) wordStarts.push(item);
      else if (l.includes(q)) includes.push(item);
    }
    return [...starts, ...wordStarts, ...includes].slice(0, 6);
  }, [searchType, query, modelOptions, yearOptions]);

  useEffect(() => {
    if (!formData.make || !formData.model || !formData.year) return;
    const entry: VehicleEntry | undefined = VEHICLES[formData.make]?.[
      formData.model
    ]?.find((v) => v.year === Number(formData.year));
    if (entry)
      setFormData((p) => ({
        ...p,
        consumption_l_100km: entry.combinedLPer100km.toString(),
      }));
  }, [formData.year]);

  const openSearch = (type: SearchType) => {
    setQuery("");
    setSearchType(type);
  };
  const selectValue = (value: string) => {
    if (searchType === "make")
      setFormData({
        make: value,
        model: "",
        year: "",
        license_plate: "",
        consumption_l_100km: "",
      });
    if (searchType === "model")
      setFormData((p) => ({ ...p, model: value, year: "" }));
    if (searchType === "year") setFormData((p) => ({ ...p, year: value }));
    Keyboard.dismiss();
    setSearchType(null);
  };

  const handleSubmit = () => {
    onSave({
      id: car?.id || "",
      make: formData.make,
      model: formData.model,
      year: Number(formData.year),
      license_plate: formData.license_plate || undefined,
      consumption_l_100km: Number(formData.consumption_l_100km) || undefined,
      fuel_efficiency: car?.fuel_efficiency,
    });
  };

  const canSubmit = !!formData.make && !!formData.model && !!formData.year;

  return (
    <Modal visible animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 20,
            padding: 24,
            borderWidth: 0.5,
            borderColor: C.border,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <CarIcon color={C.green} size={20} />
              <Text
                style={{
                  color: C.textPrimary,
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                {car ? "Edit car" : "Add a car"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onCancel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                backgroundColor: C.surfaceAlt,
                borderRadius: 16,
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X color={C.textMuted} size={16} />
            </TouchableOpacity>
          </View>

          {/* Fields */}
          {[
            {
              label: "Brand",
              value: formData.make,
              placeholder: "Search car brand",
              type: "make" as SearchType,
              disabled: false,
            },
            {
              label: "Model",
              value: formData.model,
              placeholder: "Search model",
              type: "model" as SearchType,
              disabled: !formData.make,
            },
            {
              label: "Year",
              value: formData.year,
              placeholder: "Select year",
              type: "year" as SearchType,
              disabled: !formData.model,
            },
          ].map(({ label, value, placeholder, type, disabled }) => (
            <View key={label} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: C.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => openSearch(type)}
                disabled={disabled}
                style={{
                  backgroundColor: C.surfaceAlt,
                  borderWidth: 1,
                  borderColor: disabled
                    ? C.border
                    : value
                      ? C.borderFocus
                      : C.borderMid,
                  borderRadius: C.radius,
                  height: 52,
                  justifyContent: "center",
                  paddingHorizontal: 14,
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <Text
                  style={{
                    color: value ? C.textPrimary : C.textMuted,
                    fontSize: 15,
                  }}
                >
                  {value || placeholder}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ marginTop: 8 }}>
            <Btn
              label={isSaving ? "Saving..." : "Save car"}
              onPress={handleSubmit}
              disabled={!canSubmit || isSaving}
              loading={isSaving}
            />
          </View>
        </View>
      </View>

      {/* Search modal */}
      <Modal transparent visible={!!searchType} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "90%",
                maxHeight: "55%",
                backgroundColor: C.surface,
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: 0.5,
                  borderBottomColor: C.border,
                }}
              >
                <TouchableOpacity onPress={() => setSearchType(null)}>
                  <Text style={{ color: C.textMuted, fontSize: 14 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    color: C.textPrimary,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Search
                </Text>
                <TouchableOpacity onPress={() => setSearchType(null)}>
                  <Text
                    style={{ color: C.green, fontSize: 14, fontWeight: "600" }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus
                placeholder="Type to search..."
                placeholderTextColor={C.textMuted}
                style={{
                  backgroundColor: C.surfaceAlt,
                  margin: 12,
                  borderRadius: C.radius,
                  padding: 12,
                  color: C.textPrimary,
                  fontSize: 15,
                }}
                blurOnSubmit={false}
              />
              {suggestions.length === 0 ? (
                <Text
                  style={{
                    color: C.textMuted,
                    textAlign: "center",
                    padding: 24,
                    fontSize: 14,
                  }}
                >
                  No results found
                </Text>
              ) : (
                <FlatList
                  data={suggestions}
                  keyExtractor={(i) => i}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => selectValue(item)}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderBottomWidth:
                          index < suggestions.length - 1 ? 0.5 : 0,
                        borderBottomColor: C.border,
                      }}
                    >
                      <Text style={{ color: C.textPrimary, fontSize: 15 }}>
                        {item}
                      </Text>
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
