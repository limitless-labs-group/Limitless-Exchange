import { ChakraProvider as ChakraDefaultProvider } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

import { chakraTheme } from '@/styles'

export const ChakraProvider = ({ children }: PropsWithChildren) => (
  <ChakraDefaultProvider theme={chakraTheme}>{children}</ChakraDefaultProvider>
)
