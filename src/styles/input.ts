import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  inputAnatomy.keys
)

const outlined = definePartsStyle({
  field: {
    border: '1px solid',
    borderRadius: '2px',
    borderColor: 'transparent.200',
    p: '4px 8px',
    h: isMobile ? '32px' : '24px',
    bg: 'unset',
    ...paragraphMedium,
    color: 'grey.50',
    _hover: {
      borderColor: 'transparent.700',
    },
    _focus: {
      borderColor: 'grey.50',
    },
    _placeholder: {
      color: 'transparent.700',
    },
  },
  element: {
    h: '24px',
  },
})

const grey = definePartsStyle({
  field: {
    border: '1px solid',
    borderRadius: '2px',
    borderColor: 'grey.300',
    px: isMobile ? '12px' : '8px',
    py: isMobile ? '8px' : '4px',
    h: isMobile ? '32px' : '24px',
    bg: 'unset',
    ...paragraphMedium,
    color: 'grey.800',
    _hover: {
      borderColor: 'grey.800',
    },
    _focus: {
      borderColor: 'grey.800',
    },
    _placeholder: {
      color: 'grey.500',
    },
  },
  element: {
    h: '24px',
  },
})

export const inputTheme = defineMultiStyleConfig({
  variants: { outlined, grey },
})
