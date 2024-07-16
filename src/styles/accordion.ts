import { accordionAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  accordionAnatomy.keys
)

const baseStyle = definePartsStyle({
  root: {
    w: 'full',
  },
  container: {
    p: 0,
    border: 'unset',
  },
  button: {
    p: 0,
    w: 'full',
    justifyContent: 'space-between',
    _hover: {
      bg: 'unset',
    },
  },
})

export const accordionTheme = defineMultiStyleConfig({ baseStyle })
