import LottieView from 'lottie-react-native';
import { Share, ShieldCheck } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { Trip } from '../../store/tripSlice';

interface TripConfirmationProps {
  trip: Trip;
  onConfirm: (updatedTrip: Trip) => void; // send updated trip up
  onCancel: () => void;
}

export default function TripConfirmation({ trip, onConfirm, onCancel }: TripConfirmationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Compute per-person share and driver savings
  const { totalPeople, sharePerPerson, computedSavings } = useMemo(() => {
    const nPassengers = trip.passengers ? parseInt(trip.passengers, 10) : 0; // passengers exclude driver
    const people = Math.max(1, nPassengers + 1);
    const totalCost = typeof trip.cost === 'number' ? trip.cost : 0;
    const perPerson = people > 0 ? totalCost / people : 0;
    const savings = perPerson * (people - 1);
    return {
      totalPeople: people,
      sharePerPerson: perPerson,
      computedSavings: Number(savings.toFixed(2)),
    };
  }, [trip.passengers, trip.cost]);

  const updatedTrip: Trip = { ...trip, savings: computedSavings };

  const handleConfirm = () => {
    // Show the piggy bank animation
    setShowAnimation(true);

    // Start the animation
    animationRef.current?.play();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, // quick fade in
      useNativeDriver: true,
    }).start();

    // Wait 3s, fade out smoothly, then call onConfirm
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800, // smooth fade out
        useNativeDriver: true,
      }).start(() => {
        setShowAnimation(false);
        onConfirm(updatedTrip);
      });
    }, 3000);
  };

  return (
    <Modal transparent animationType="slide">
      <View className="flex-1 bg-black justify-center items-center p-4">
        <View className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
          {showAnimation && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 16,
                  zIndex: 10,
                }}
              >
                <LottieView
                  ref={animationRef}
                  source={require('../../assets/animations/piggy_bank.json')}
                  autoPlay
                  loop={false}
                  style={{ width: 160, height: 160 }}
                />
              </Animated.View>
            )}
          <Text className="text-center text-3xl text-white font-semibold mb-3">
            Plan your trip
          </Text>

          <Text className="text-center text-2xl text-gray-400 mb-4">
            Based on a distance of {trip.distance !== undefined ? trip.distance.toFixed(1) : 'N/A'} km...
          </Text>

          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-lg text-gray-400">Total Trip Cost :</Text>
            <Text className="text-2xl font-bold text-green-400 mb-2">
              ${typeof trip.cost === 'number' ? trip.cost.toFixed(2) : '0.00'}
            </Text>

            <View className="border-t border-gray-200 my-3" />

            <Text className="text-lg text-gray-400">Share per person :</Text>
            <Text className="text-2xl font-bold text-green-400">
              ${sharePerPerson.toFixed(2)}
            </Text>
            <Text className="text-lg text-gray-400">
              ({totalPeople} people)
            </Text>
          </View>

          <View className="flex-row items-center mb-4">
            <ShieldCheck color="#4ade80" size={23} />
            <Text className="ml-2 text-2xl text-green-400 font-semibold">
              You save ${updatedTrip.savings?.toFixed(2) ?? '0.00'} as the driver !
            </Text>
          </View>

          <Pressable
            onPress={handleConfirm}
            disabled={showAnimation} // prevent double click
            className={`py-2 rounded-lg mb-4 items-center mt-5 ${showAnimation ? 'bg-gray-700' : 'bg-main'}`}
          >
            <Text className="text-white text-xl font-medium">
              {showAnimation ? 'Processing...' : 'Confirm CoTrip'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            className="flex-row justify-center items-center py-2 rounded-lg border border-gray-600"
          >
            <Share color="#10B981" size={16} />
            <Text className="ml-2 text-main text-xl">Share with Passengers</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
