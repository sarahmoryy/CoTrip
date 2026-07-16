import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../SupabaseConfig";

export default function Index() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!checked) {
          if (session?.user) {
            router.replace("/home");
          } else {
            router.replace("/login");
          }
          setChecked(true); // ✅ prevents loop
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [checked]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
