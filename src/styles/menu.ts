import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { commonButtonProps } from '@/styles/button'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys)

// define the base component styles
const baseStyle = definePartsStyle({
  // define the part you're going to style
  button: {
    ...commonButtonProps,
    bg: 'grey.300',
    borderRadius: '8px',
    ...(isMobile
      ? {}
      : {
          _hover: {
            bg: 'grey.400',
          },
        }),
    _disabled: {
      bg: 'grey.300',
      pointerEvents: 'none',
    },
  },
  list: {
    p: '4px',
    bg: 'grey.100',
    border: 'unset',
    minW: 'unset',
    _dark: {
      boxShadow: 'unset',
    },
  },
  item: {
    bg: 'unset',
    borderRadius: '8px',
    px: '4px',
    py: isMobile ? '6px' : '2px',
    ...(isMobile
      ? {}
      : {
          _hover: {
            bg: 'grey.400 !important',
          },
        }),
  },
})

// define custom variants
const variants = {
  outlined: {
    button: {
      borderLeftRadius: '8px',
      border: '1px solid',
      borderColor: 'grey.300',
      bg: 'unset',
      ...(isMobile
        ? {}
        : {
            _hover: {
              bg: 'unset',
              borderColor: 'grey.800',
            },
          }),
      _active: {
        borderColor: 'grey.800',
      },
    },
  },
  transparent: {
    button: {
      background: 'unset !important',
    },
    list: {
      border: '1px solid',
      borderColor: 'grey.200',
      background: 'grey.50',
      py: '16px !important',
      px: '12px !important',
    },
  },
  blue: {
    button: {
      w: 'full',
      bg: 'blue.400',
      ...(isMobile
        ? {}
        : {
            _hover: {
              bg: 'blue.400',
            },
          }),
    },
    list: {
      p: 0,
      bg: 'blue.500',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '8px',
    },
    item: {
      p: isMobile ? '16px' : '8px',
      bg: 'whiteAlpha.200',
      _hover: {
        bg: 'whiteAlpha.30',
      },
    },
  },
  block: {
    item: {
      background: 'none',
      _hover: { background: 'none' },
      _focus: { background: 'none' },
      _active: { background: 'none' },
      padding: 0,
      border: 'none',
      cursor: 'default',
    },

    button: {
      borderRadius: '2px',
      background: 'unset',
      p: 0,
      h: 'fit-content',
      _hover: { bg: 'none' },
      _active: { bg: 'grey.100' },
    },

    list: {
      bg: 'grey.100',
      p: '8px',
    },
  },
}

// export the base styles in the component theme
export const menuTheme = defineMultiStyleConfig({ baseStyle, variants })
