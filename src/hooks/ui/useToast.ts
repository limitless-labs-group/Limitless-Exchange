import { useToast as useChakraToast } from '@chakra-ui/react'

export const useToast = () =>
  useChakraToast({
    position: 'bottom-right',
    duration: 10000,
  })
