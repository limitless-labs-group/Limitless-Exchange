import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { PropsWithChildren } from 'react'
import { useThemeProvider } from '@/providers/Chakra'

export default function RainbowProvider({ children }: PropsWithChildren) {
  const { mode } = useThemeProvider()

  return (
    <RainbowKitProvider theme={mode === 'dark' ? darkTheme() : lightTheme()}>
      {children}
    </RainbowKitProvider>
  )
}
