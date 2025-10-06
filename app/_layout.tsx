import { Stack } from "expo-router";
import { AuthProvider } from '../hooks/useAuth';

import "@/services/firebase";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  )
}
