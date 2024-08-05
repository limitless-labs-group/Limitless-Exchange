import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { h1Regular } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys)

const blueModal = definePartsStyle({
  dialogContainer: {
    p: '0',
    overflowX: 'hidden',
    overflowY: 'scroll',
    webkitOverflowScrolling: 'touch',
    alignItems: 'baseline',
  },
  dialog: {
    bg: 'blue.500',
    boxShadow: 'none',
    borderRadius: isMobile ? 0 : '2px',
    willChange: 'unset !important',
  },
  body: {
    p: 0,
    mt: '32px',
  },
  header: {
    mt: '28px',
    px: '16px',
    py: 0,
  },
  closeButton: {
    color: 'white',
    top: 1,
    right: 1,
  },
})

const commonModal = definePartsStyle({
  dialog: {
    borderRadius: isMobile ? 0 : '2px',
    bg: 'grey.100',
    p: ' 0 16px 16px',
    willChange: 'unset !important',
  },
  body: {
    willChange: 'unset',
  },
  header: {
    mt: '28px',
    alignItems: 'center',
    p: 0,
    ...h1Regular,
    fontSize: isMobile ? '32px' : '16px',
  },
  closeButton: {
    outline: 'none',
    _focusVisible: {
      boxShadow: 'none',
    },
  },
})

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'rgba(0, 0, 0, 0.5)', //change the background
  },
  closeButton: {
    outline: 'none',
  },
})

export const modalTheme = defineMultiStyleConfig({
  variants: { blueModal, commonModal },
  baseStyle,
})
