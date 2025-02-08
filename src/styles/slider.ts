import { sliderAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys)
const baseStyle = definePartsStyle({
  thumb: {
    bg: 'grey.300',
    width: '16px',
    height: '16px',
  },
  track: {
    bg: 'grey.100',
  },
  filledTrack: {
    bg: 'grey.800',
  },
})
export const sliderTheme = defineMultiStyleConfig({ baseStyle })
