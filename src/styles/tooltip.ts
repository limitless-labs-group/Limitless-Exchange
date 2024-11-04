import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

// define styles for custom variant
const black = defineStyle(() => {
  return {
    bg: 'black',
    color: 'white',
    borderRadius: '2px',
    padding: '4px 8px',
  }
})

// define custom variants
const variants = {
  black,
}

// export the component theme
export const tooltipTheme = defineStyleConfig({ variants })
