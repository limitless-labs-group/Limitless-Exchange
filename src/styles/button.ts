import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const commonButtonStyles = {
  gap: 0,
  alignItems: 'center',
  overflow: 'hidden',
  fontSize: '14px',
  borderRadius: 'lg',
  _disabled: {
    pointerEvents: 'none',
  },
}

const solid = defineStyle({
  ...commonButtonStyles,
  color: 'white',
  bg: 'brand',
  _hover: {
    bg: 'brand',
  },
  _active: {
    bg: 'brand',
  },
})

const gray = defineStyle({
  ...commonButtonStyles,
  color: 'white',
  bg: 'fontLight',
  h: '30px',
  _hover: {
    bg: 'grey.700',
  },
  _active: {
    bg: 'grey.700',
  },
})

const outline = defineStyle({
  ...commonButtonStyles,
  bg: 'grey.100',
  color: 'fontLight',
  borderWidth: 0,
  _hover: {
    bg: 'bgLight',
  },
  _active: {
    bg: 'bgLight',
  },
})

const transparent = defineStyle({
  ...commonButtonStyles,
  bg: 'unset',
  _hover: {
    bg: 'bgLight',
  },
  _active: {
    bg: 'bgLight',
  },
})

const green = defineStyle({
  ...commonButtonStyles,
  bg: 'green',
  _hover: {
    bg: 'green',
  },
  _active: {
    bg: 'green',
  },
  color: 'white',
})

const red = defineStyle({
  ...commonButtonStyles,
  bg: 'red',
  _hover: {
    bg: 'red',
  },
  _active: {
    bg: 'red',
  },
  color: 'white',
})

const text = defineStyle({
  ...commonButtonStyles,
  px: 0,
  bg: 'none',
  fontWeight: 'normal',
  justifyContent: 'flex-start',
  _hover: {
    bg: 'none',
  },
  _active: {
    bg: 'none',
  },
})

const black = defineStyle({
  ...commonButtonStyles,
  bg: 'black',
  color: 'white',
  _hover: {
    bg: 'black',
  },
  _active: {
    bg: 'black',
  },
})

const icon = defineStyle({
  ...commonButtonStyles,
  bg: 'white',
  color: 'black',
  _hover: {
    bg: 'bgLight',
  },
  _active: {
    bg: 'bgLight',
  },
  border: '1px solid',
  borderColor: 'grey.300',
  minW: '32px',
  p: 0,
  h: '32px',
  w: '32px',
})

const smallFont = defineStyle({
  fontSize: '12px',
})

export const buttonTheme = defineStyleConfig({
  variants: { solid, outline, gray, transparent, green, red, text, black, icon },
  sizes: { smallFont },
})
