import { chakraTheme } from '@/styles'
import { ChakraProvider as ChakraDefaultProvider } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export const ChakraProvider = ({ children }: PropsWithChildren) => (
  <ChakraDefaultProvider theme={chakraTheme}>{children}</ChakraDefaultProvider>
)
