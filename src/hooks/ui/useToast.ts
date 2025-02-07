import { useToast as useChakraToast } from '@chakra-ui/react'

export const useToast = () =>
  useChakraToast({
    position: 'top-right',
    duration: 5000,
    isClosable: true,
  })
