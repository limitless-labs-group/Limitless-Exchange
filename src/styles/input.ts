import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  inputAnatomy.keys
)

const outlined = definePartsStyle({
  field: {
    border: '1px solid',
    borderRadius: '8px',
    borderColor: 'greyAlpha.grey50.20',
    p: '4px 8px',
    h: isMobile ? '24px' : '32px',
    bg: 'unset',
    ...paragraphMedium,
    color: 'white',
    _hover: {
      borderColor: 'whiteAlpha.70',
    },
    _focus: {
      borderColor: 'white',
    },
    _placeholder: {
      color: 'grey.300',
    },
    _invalid: {
      boxShadow: 'unset',
    },
  },
  element: {
    h: '24px',
  },
})

const grey = definePartsStyle({
  field: {
    border: '1px solid',
    borderRadius: '8px',
    borderColor: 'whiteAlpha.30',
    px: isMobile ? '12px' : '8px',
    py: isMobile ? '8px' : '4px',
    h: '32px',
    bg: 'unset',
    ...paragraphMedium,
    color: 'grey.800',
    _hover: {
      borderColor: 'grey.400',
    },
    _focus: {
      borderColor: 'grey.800',
    },
    _placeholder: {
      color: 'grey.300',
    },
    _invalid: {
      borderColor: 'red.500',
    },
  },
  element: {
    h: '24px',
  },
})

export const inputTheme = defineMultiStyleConfig({
  variants: { outlined, grey },
})
