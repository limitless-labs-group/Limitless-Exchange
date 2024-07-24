import { chakraTheme } from '@/styles'
import {
  ChakraProvider as ChakraDefaultProvider,
  ColorMode,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react'
import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { BaseNextRequest } from 'next/dist/server/base-http'
import { lightThemeColors } from '@/styles/light-theme-colors'
import { darkThemeColors } from '@/styles/dark-theme-colors'
import { ColorScheme } from '@/types'

type ThemeProviderContext = {
  setLightTheme: () => void
  setDarkTheme: () => void
  colors: ColorScheme
  mode?: ColorMode
}

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(undefined)

export const useThemeProvider = (): ThemeProviderContext => {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error('useTokenFilter must be used within a TokenFilterProvider')
  }
  return context
}

export const ThemeProvider = ({
  cookies,
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  const colorModeManager =
    typeof cookies === 'string' ? cookieStorageManagerSSR(cookies) : localStorageManager
  const [colors, setColors] = useState<ColorScheme>(
    colorModeManager.get() === 'dark' ? darkThemeColors : lightThemeColors
  )
  const [mode, setMode] = useState(colorModeManager.get())

  const themeWithColors = {
    ...chakraTheme,
    colors,
  }

  const setLightTheme = () => {
    setColors(lightThemeColors)
    setMode('light')
    return
  }

  const setDarkTheme = () => {
    setColors(darkThemeColors)
    setMode('dark')
    return
  }

  return (
    <ThemeProviderContext.Provider value={{ setLightTheme, setDarkTheme, mode, colors }}>
      <ChakraDefaultProvider theme={themeWithColors} colorModeManager={colorModeManager}>
        {/*<ColorModeScript initialColorMode={theme.config.initialColorMode} />*/}
        {children}
      </ChakraDefaultProvider>
    </ThemeProviderContext.Provider>
  )
}

export function getServerSideProps({ req }: { req: BaseNextRequest }) {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}
