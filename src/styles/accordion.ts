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
  panel: {
    px: 0,
  },
})

const paper = definePartsStyle({
  root: {
    w: 'full',
  },
  container: {
    p: '16px',
    borderRadius: '12px',
    border: '3px solid',
    w: 'full',
  },
  // item: {
  //   border: '3px solid',
  //   borderColor: 'grey.100',
  // },
})

export const accordionTheme = defineMultiStyleConfig({ baseStyle, variants: { paper } })
