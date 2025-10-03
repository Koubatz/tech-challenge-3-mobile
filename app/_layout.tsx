import { defaultConfig } from "@tamagui/config/v4";
import { PortalProvider } from '@tamagui/portal';
import { Stack } from "expo-router";
import { createTamagui, TamaguiProvider } from "tamagui";
import { AuthProvider } from '../hooks/useAuth';

const config = createTamagui(defaultConfig);

import "@/services/firebase";

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <PortalProvider shouldAddRootHost>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthProvider>
      </PortalProvider>
    </TamaguiProvider>
  )
}
