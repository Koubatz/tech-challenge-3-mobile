import { Stack } from "expo-router";
import { AccountProvider } from "../hooks/useAccount";
import { AuthProvider } from "../hooks/useAuth";
import { CardProvider } from "../hooks/useCards";

import "@/services/firebase";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AccountProvider>
        <CardProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </CardProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
