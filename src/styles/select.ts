import { selectAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  selectAnatomy.keys
)

const baseStyle = definePartsStyle({
  field: {
    paddingLeft: '8px',
  },
})

export const selectTheme = defineMultiStyleConfig({ baseStyle })
