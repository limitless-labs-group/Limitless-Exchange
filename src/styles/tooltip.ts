import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

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
    bg: 'whiteAlpha.70',
    color: 'white',
    padding: '8px 12px',
  }
})

// define custom variants
const variants = {
  black,
  grey,
}

// export the component theme
export const tooltipTheme = defineStyleConfig({ variants })
