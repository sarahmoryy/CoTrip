import { autocompletePlaces, placeDetails } from '@/assets/api/mapsApi';
import debounce from 'lodash.debounce';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Prediction = { description: string; place_id: string };

type Props = {
  label?: string;
  placeholder?: string;
  initialText?: string;
  minChars?: number; // don't query until this many chars (default 2)
  onSelected: (v: { description: string; lat: number; lng: number; placeId: string }) => void;
  onTextChange?: (text: string) => void;
};

export default function AutocompleteInput({
  label = 'Destination',
  placeholder = 'Type a place or address',
  initialText = '',
  minChars = 2,
  onSelected,
  onTextChange,
}: Props) {
  const [query, setQuery] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track latest request to avoid setting stale results after fast typing
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
      // ignore stale responses
      if (myReq !== reqCounter.current) return;
      setPredictions(preds);
    } catch (e: any) {
      if (myReq !== reqCounter.current) return;
      setPredictions([]);
      setError(e?.message ?? 'Failed to fetch suggestions');
    } finally {
      if (myReq === reqCounter.current) setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchPredictions, 250), []);

  useEffect(() => {
    return () => {
      // cleanup debounce on unmount to avoid setState after unmount
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const handleChange = (text: string) => {
    setQuery(text);
    onTextChange?.(text);
    debouncedFetch(text);
  };

  const clearInput = () => {
    setQuery('');
    setPredictions([]);
    setError(null);
    onTextChange?.('');
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
      setError(e?.message ?? 'Failed to resolve place');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ zIndex: 50 /* helps Android overlay the list */ }}>
      {/* Label */}
      {label ? (
        <View className="flex-row items-center mb-2">
          <Text className="ml-2 text-white text-xl">{label}</Text>
        </View>
      ) : null}

      {/* Input + clear */}
      <View className="h-14 bg-gray-800 border border-gray-600 rounded-lg flex-row items-center">
        <TextInput
          placeholder={placeholder}
          value={query}
          onChangeText={handleChange}
          placeholderTextColor="#9CA3AF"
          style={{
            flex: 1,
            height: 56,
            paddingHorizontal: 12,
            color: '#fff',
            fontSize: 16,
            lineHeight: 20,
            textAlignVertical: 'center',
          }}
        />
        {query ? (
          <TouchableOpacity onPress={clearInput} className="px-3 py-2">
            <Text className="text-gray-300">Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View className="mt-2">
          <ActivityIndicator />
        </View>
      ) : null}

      {!!error && !loading ? (
        <Text className="text-red-400 mt-2">{error}</Text>
      ) : null}

      {!loading && predictions.length > 0 && (
        <View className="mt-2 bg-gray-800 border border-gray-700 rounded-lg max-h-56">
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={predictions}
            keyExtractor={(it) => it.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-700"
                onPress={() => pickItem(item.place_id)}
              >
                <Text className="text-white">{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
