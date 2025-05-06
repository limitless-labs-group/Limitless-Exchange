import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const baseStyle = {
  padding: '8px',
  color: 'grey.800',
  borderRadius: '8px',
  borderColor: 'unset',
}

// define styles for custom variant
const black = defineStyle(() => {
  return {
    bg: 'black',
    color: 'white',
    borderRadius: '8px',
    padding: '4px 8px',
  }
})

const grey = defineStyle(() => {
  return {
    bg: 'transparent.70',
  }
})

// define custom variants
const variants = {
  black,
  grey,
}

// export the component theme
export const tooltipTheme = defineStyleConfig({ variants, baseStyle })
