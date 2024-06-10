import type { InputProps } from '@chakra-ui/react'
import { Input as ChakraInput } from '@chakra-ui/react'

import { borderRadius } from '@/styles'

export const Input = ({ ...props }: InputProps) => (
  <ChakraInput
    borderRadius={borderRadius}
    outline={'none'}
    // border={'none'}
    bg={'transparent'}
    fontSize={'16px'}
    color={'text'}
    h={'60px'}
    _placeholder={{ color: 'fontLight' }}
    {...props}
  />
)
