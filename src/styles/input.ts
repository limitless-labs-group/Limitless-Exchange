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
    borderColor: 'grey.200',
    p: '4px 8px',
    h: isMobile ? '24px' : '32px',
    bg: 'unset',
    ...paragraphMedium,
    _hover: {
      borderColor: 'grey.400',
    },
    _focus: {
      borderColor: 'grey.800',
    },
    _placeholder: {
      color: 'grey.500',
    },
    _invalid: {
      boxShadow: 'unset',
    },
    _disabled: {
      borderColor: 'grey.300',
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
    borderColor: 'grey.200',
    px: isMobile ? '12px' : '8px',
    py: isMobile ? '8px' : '4px',
    h: '32px',
    bg: 'unset',
    ...paragraphMedium,
    _hover: {
      borderColor: 'grey.400',
    },
    _focus: {
      borderColor: 'grey.800',
    },
    _placeholder: {
      color: 'grey.500',
    },
    _invalid: {
      borderColor: 'red.500',
    },
    _disabled: {
      borderColor: 'grey.300',
    },
  },
  element: {
    h: '24px',
  },
})

export const inputTheme = defineMultiStyleConfig({
  variants: { outlined, grey },
})
