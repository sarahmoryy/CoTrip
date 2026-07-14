import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../SupabaseConfig";

export default function Index() {
  useEffect(() => {
    let redirected = false;

    const redirect = (hasSession: boolean) => {
      if (redirected) return;
      redirected = true;
      router.replace(hasSession ? "/home" : "/login");
    };

    supabase.auth.getSession().then(({ data }) => {
      redirect(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      redirect(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
