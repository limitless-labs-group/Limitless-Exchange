import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'
import { commonButtonProps } from '@/styles/button'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys)

// define the base component styles
const baseStyle = definePartsStyle({
  // define the part you're going to style
  button: {
    ...commonButtonProps,
    bg: 'grey.300',
    borderRadius: '2px',
    _hover: {
      bg: 'grey.400',
    },
    _disabled: {
      bg: 'grey.300',
      pointerEvents: 'none',
    },
  },
  list: {
    p: '4px',
    bg: 'grey.300',
    border: 'unset',
    minW: 'unset',
  },
  item: {
    bg: 'unset',
    borderRadius: '2px',
    p: '4px',
    _hover: {
      bg: 'grey.400 !important',
    },
  },
})
// export the base styles in the component theme
export const menuTheme = defineMultiStyleConfig({ baseStyle })
