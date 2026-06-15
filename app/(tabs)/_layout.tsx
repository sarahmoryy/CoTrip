import { Tabs } from "expo-router";
import { Car, Home, MapPin, User } from "lucide-react-native";
import React from "react";
import { useTheme } from "../../components/ui/theme";

export default function TabsLayout() {
  const { C } = useTheme();
  return (
    <Tabs
      screenOptions={{
        lazy: false,
        tabBarActiveTintColor: C.tabActive,
        tabBarInactiveTintColor: C.tabInactive,
        tabBarStyle: {
          backgroundColor: C.tabBg,
          borderTopWidth: 0.5,
          borderTopColor: C.tabBorder,
          height: 82,
          paddingBottom: 22,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <MapPin color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: "Cars",
          tabBarIcon: ({ color, size }) => (
            <Car color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size - 2} />
          ),
        }}
      />
    </Tabs>
  );
}
