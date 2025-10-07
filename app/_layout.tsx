import { Stack } from "expo-router";
import { AccountProvider } from "../hooks/useAccount";
import { AuthProvider } from "../hooks/useAuth";

import "@/services/firebase";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AccountProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AccountProvider>
    </AuthProvider>
  );
}
