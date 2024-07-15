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

export const inputTheme = defineMultiStyleConfig({
  variants: { outlined },
})
