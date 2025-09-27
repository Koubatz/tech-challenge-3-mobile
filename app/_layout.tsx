import { Stack } from "expo-router";
import { TamaguiProvider } from "tamagui";
import config from "../tamagui.config";

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Index" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen
          name="dashboard"
          options={{ title: "Dashboard Financeiro", headerShown: false }}
        />
        <Stack.Screen
          name="cards"
          options={{ title: "Cartões", headerShown: false }}
        />
      </Stack>
    </TamaguiProvider>
  );
}
