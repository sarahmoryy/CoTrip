import { autocompletePlaces, placeDetails } from "@/assets/api/mapsApi";
import debounce from "lodash.debounce";
import { X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [query, setQuery] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const reqCounter = useRef(0);

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

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const handleChange = (text: string) => {
    setQuery(text);
    onTextChange?.(text);
    debouncedFetch(text);
  };

  const clearInput = () => {
    setQuery("");
    setPredictions([]);
    setError(null);
    onTextChange?.("");
  };

  const pickItem = async (place_id: string) => {
    try {
      setLoading(true);
      const d = await placeDetails(place_id);
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
            color: "#9CA3AF",
            fontSize: 12,
            fontWeight: "500",
            marginBottom: 6,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      ) : null}

      {/* Input row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#1F2937",
          borderWidth: 1,
          borderColor: isFocused ? "#4ade80" : "#374151",
          borderRadius: 10,
          minHeight: 52,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <TextInput
          value={query}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          multiline={false}
          numberOfLines={1}
          scrollEnabled={true}
          style={{
            flex: 1,
            fontSize: 15,
            color: "#F9FAFB",
            paddingVertical: 0,
            // vertically centers single-line text on both platforms
            lineHeight: 20,
          }}
        />

        {/* Clear button — pill style, clearly tappable */}
        {query ? (
          <TouchableOpacity
            onPress={clearInput}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              marginLeft: 8,
              backgroundColor: "#374151",
              borderRadius: 20,
              width: 24,
              height: 24,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X color="#9CA3AF" size={13} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : null}

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#4ade80"
            style={{ marginLeft: 8 }}
          />
        ) : null}
      </View>

      {!!error && !loading ? (
        <Text style={{ color: "#F87171", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}

      {/* Dropdown suggestions */}
      {!loading && visiblePredictions.length > 0 && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: "#1F2937",
            borderWidth: 1,
            borderColor: "#374151",
            borderRadius: 10,
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
                    index !== visiblePredictions.length - 1 ? 1 : 0,
                  borderBottomColor: "#374151",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* Small pin dot accent */}
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#4ade80",
                    opacity: 0.7,
                    flexShrink: 0,
                  }}
                />
                <Text
                  style={{
                    color: "#E5E7EB",
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
