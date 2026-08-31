import { autocompletePlaces, placeDetails } from "@/assets/api/mapsApi";
import debounce from "lodash.debounce";
import { X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "./ui/theme";

type Prediction = { description: string; place_id: string };
type Props = {
  label?: string;
  placeholder?: string;
  initialText?: string;
  minChars?: number;
  onSelected: (v: {
    description: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
  onTextChange?: (text: string) => void;
};

export default function AutocompleteInput({
  label = "",
  placeholder = "Type a place or address",
  initialText = "",
  minChars = 2,
  onSelected,
  onTextChange,
}: Props) {
  const { C } = useTheme();
  const [query, setQuery] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const reqCounter = useRef(0);
  const hasSelected = useRef(false);
  const settingProgrammatically = useRef(false);

  const fetchPredictions = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < minChars) {
      setPredictions([]);
      setLoading(false);
      setError(null);
      return;
    }
    const myReq = ++reqCounter.current;
    setLoading(true);
    setError(null);
    try {
      const preds = await autocompletePlaces(trimmed);
      if (myReq !== reqCounter.current) return;
      setPredictions(preds);
    } catch (e: any) {
      if (myReq !== reqCounter.current) return;
      setPredictions([]);
      setError(e?.message ?? "Failed to fetch suggestions");
    } finally {
      if (myReq === reqCounter.current) setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchPredictions, 250), []);
  useEffect(
    () => () => {
      debouncedFetch.cancel();
    },
    [debouncedFetch],
  );

  const handleChange = (text: string) => {
    if (settingProgrammatically.current) {
      settingProgrammatically.current = false;
      return;
    }
    hasSelected.current = false;
    setQuery(text);
    onTextChange?.(text);
    debouncedFetch(text);
  };
  const clearInput = () => {
    hasSelected.current = false;
    setQuery("");
    setPredictions([]);
    setError(null);
    onTextChange?.("");
  };

  const pickItem = async (place_id: string) => {
    debouncedFetch.cancel();
    hasSelected.current = true;
    setPredictions([]);
    setError(null);
    Keyboard.dismiss();
    try {
      setLoading(true);
      const d = await placeDetails(place_id);
      settingProgrammatically.current = true;
      setQuery(d.description);
      setPredictions([]);
      onSelected({
        description: d.description,
        lat: d.location.lat,
        lng: d.location.lng,
        placeId: place_id,
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to resolve place");
    } finally {
      setLoading(false);
    }
  };

  const visiblePredictions = useMemo(
    () => predictions.slice(0, 6),
    [predictions],
  );

  return (
    <View style={{ zIndex: 50 }}>
      {label ? (
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
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.surfaceAlt,
          borderWidth: 1,
          borderColor: isFocused ? C.borderFocus : C.borderMid,
          borderRadius: C.radius,
          minHeight: 52,
          paddingHorizontal: 12,
          paddingVertical: 4,
        }}
      >
        <TextInput
          value={query}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          multiline={false}
          numberOfLines={1}
          scrollEnabled
          style={{
            flex: 1,
            fontSize: 15,
            color: C.textPrimary,
            paddingVertical: 0,
            lineHeight: 20,
          }}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={C.green}
            style={{ marginLeft: 8 }}
          />
        )}
        {query && !loading ? (
          <TouchableOpacity
            onPress={clearInput}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              marginLeft: 8,
              backgroundColor: C.borderMid,
              borderRadius: 12,
              width: 22,
              height: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X color={C.textSecondary} size={12} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : null}
      </View>

      {!!error && !loading && (
        <Text style={{ color: "#F87171", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}

      {!loading && !hasSelected.current && visiblePredictions.length > 0 && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: C.surfaceAlt,
            borderWidth: 1,
            borderColor: C.borderMid,
            borderRadius: C.radius,
            overflow: "hidden",
          }}
        >
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={visiblePredictions}
            keyExtractor={(it) => it.place_id}
            scrollEnabled={false}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => pickItem(item.place_id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderBottomWidth:
                    index !== visiblePredictions.length - 1 ? 0.5 : 0,
                  borderBottomColor: C.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: C.green,
                    opacity: 0.6,
                    flexShrink: 0,
                  }}
                />
                <Text
                  style={{
                    color: C.textPrimary,
                    fontSize: 14,
                    flex: 1,
                    lineHeight: 19,
                  }}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
