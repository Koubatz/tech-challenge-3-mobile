import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { ROUTE_PROTECTED_HOME } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F6FA",
        }}
      >
        <ActivityIndicator size="large" color="#294FC1" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={ROUTE_PROTECTED_HOME} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
