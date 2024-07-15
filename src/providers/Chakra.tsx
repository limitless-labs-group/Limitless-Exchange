import { chakraTheme } from '@/styles'
import {
  ChakraProvider as ChakraDefaultProvider,
  ColorModeScript,
  cookieStorageManagerSSR,
  localStorageManager,
  theme,
} from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { BaseNextRequest } from 'next/dist/server/base-http'

export const ChakraProvider = ({
  cookies,
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  const colorModeManager =
    typeof cookies === 'string' ? cookieStorageManagerSSR(cookies) : localStorageManager
  return (
    <ChakraDefaultProvider theme={chakraTheme} colorModeManager={colorModeManager}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      {children}
    </ChakraDefaultProvider>
  )
}

export function getServerSideProps({ req }: { req: BaseNextRequest }) {
  return {
    props: {
      // first time users will not have any cookies and you may not return
      // undefined here, hence ?? is necessary
      cookies: req.headers.cookie ?? '',
    },
  }
}
