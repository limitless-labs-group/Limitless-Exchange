import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys)

const blueModal = definePartsStyle({
  dialogContainer: {
    bg: 'blue.500',
    p: '16px',
  },
  dialog: {
    bg: 'blue.500',
    boxShadow: 'none',
  },
  body: {
    p: 0,
    mt: '16px',
  },
  header: {
    color: 'white',
    p: 0,
    mt: '32px',
  },
  closeButton: {
    color: 'white',
    top: 1,
    right: 1,
  },
})

export const modalTheme = defineMultiStyleConfig({
  variants: { blueModal },
})
