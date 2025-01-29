import {
  ChakraProvider as ChakraDefaultProvider,
  ColorMode,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react'
import { BaseNextRequest } from 'next/dist/server/base-http'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { chakraTheme } from '@/styles'
import { darkThemeColors } from '@/styles/dark-theme-colors'
import { lightThemeColors } from '@/styles/light-theme-colors'
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
  const [mode, setMode] = useState<ColorMode>(colorModeManager.get() || 'light')

  const themeWithColors = {
    ...chakraTheme,
    colors,
  }

  const setLightTheme = () => {
    setColors(lightThemeColors)
    setMode('light')
    if (isMobile) {
      localStorage.setItem('chakra-ui-color-mode', 'light')
    }
    return
  }

  const setDarkTheme = () => {
    setColors(darkThemeColors)
    setMode('dark')
    if (isMobile) {
      localStorage.setItem('chakra-ui-color-mode', 'dark')
    }
    return
  }

  useEffect(() => {
    if (!colorModeManager.get()) {
      colorModeManager.set('light')
    }
  }, [])

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
