import { defaultConfig } from "@tamagui/config/v4";
import { PortalProvider } from '@tamagui/portal';
import { Stack } from "expo-router";
import { createTamagui, TamaguiProvider } from "tamagui";

const config = createTamagui(defaultConfig);

import "@/services/firebase";

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <PortalProvider shouldAddRootHost>
        <Stack />
      </PortalProvider>
    </TamaguiProvider>
  )
}
