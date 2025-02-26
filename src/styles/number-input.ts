import { numberInputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  numberInputAnatomy.keys
)

const baseStyle = definePartsStyle({
  root: {
    borderColor: 'grey.300',
    _hover: {
      borderColor: 'grey.400',
    },
    _focus: {
      borderColor: 'grey.800',
    },
  },
  field: {
    border: '1px solid',
    borderRadius: '8px',
    px: isMobile ? '12px' : '8px',
    py: isMobile ? '8px' : '4px',
    h: isMobile ? '32px' : '26px',
    bg: 'unset',
    ...paragraphMedium,
    color: 'grey.800',
    _hover: {
      borderColor: 'grey.400',
    },
    _focusVisible: {
      borderColor: 'grey.800',
    },
    _focus: {
      borderColor: 'grey.800',
      boxShadow: 'unset',
    },
    _placeholder: {
      color: 'grey.500',
    },
    _invalid: {
      borderColor: 'red.500',
    },
  },
  element: {
    h: '24px',
  },
})

export const numberInputTheme = defineMultiStyleConfig({ baseStyle })
