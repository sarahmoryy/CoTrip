import { Tabs } from "expo-router";
import { CalendarDays, Clock, Home, Plus, User } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { M } from "../../components/mockup/theme";

function CenterPostButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "flex-start" }}
    >
      <View
        style={{
          marginTop: -22,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: M.amber400,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: M.amber400,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <Plus color={M.white} size={30} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        lazy: false,
        tabBarActiveTintColor: M.amber500,
        tabBarInactiveTintColor: M.stone500,
        tabBarStyle: {
          backgroundColor: M.surface,
          borderTopColor: M.stone100,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "My Rides",
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "",
          tabBarButton: (props) => <CenterPostButton onPress={props.onPress as any} />,
        }}
      />
      <Tabs.Screen
        name="past"
        options={{
          title: "Past Trips",
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen name="cars" options={{ href: null }} />
      <Tabs.Screen name="savings" options={{ href: null }} />
      <Tabs.Screen name="account" options={{ href: null }} />
    </Tabs>
  );
}
