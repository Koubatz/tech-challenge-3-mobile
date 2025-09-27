import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'

const config = createTamagui({
  defaultFont: 'body',
  fonts: {
    body: {
      family: 'System',
      size: {
        12: 12,
        14: 14,
        16: 16,
        18: 18,
        20: 20,
        22: 22,
        24: 24,
      },
    },
  },
  themes,
  tokens,
  shorthands,
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
