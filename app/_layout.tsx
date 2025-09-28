import { defaultConfig } from "@tamagui/config/v4";
import { PortalProvider } from "@tamagui/portal";
import { Stack } from "expo-router";
import { createTamagui, TamaguiProvider } from "tamagui";

import "@/services/firebase";

const config = createTamagui(defaultConfig);

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <PortalProvider shouldAddRootHost>
        <Stack />
      </PortalProvider>
    </TamaguiProvider>
  );
}
