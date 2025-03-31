import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { h1Regular } from '@/styles/fonts/fonts.styles'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys)

const blueModal = definePartsStyle({
  dialogContainer: {
    bg: 'blue.500',
    p: '0',
    overflowX: 'hidden',
    overflowY: 'scroll',
    webkitOverflowScrolling: 'touch',
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
    p: '0px 16px',
    mt: '32px',
  },
  closeButton: {
    color: 'white',
    top: 1,
    right: 1,
  },
})

const commonModal = definePartsStyle({
  dialog: {
    borderRadius: '8px',
    bg: 'grey.100',
    p: '16px',
  },
  header: {
    alignItems: 'center',
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
    zIndex: 9000,
  },
  dialogContainer: {
    zIndex: 9000,
  },
  closeButton: {
    outline: 'none',
  },
})

export const modalTheme = defineMultiStyleConfig({
  variants: { blueModal, commonModal },
  baseStyle,
})
