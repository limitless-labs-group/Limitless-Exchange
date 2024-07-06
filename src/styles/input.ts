import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  inputAnatomy.keys
)

const outlined = definePartsStyle({
  field: {
    border: '1px solid',
    borderRadius: '2px',
    borderColor: 'grey.300',
    p: '4px 8px',
    fontWeight: 500,
    h: '24px',
    _placeholder: {
      color: 'grey.300',
    },
  },
})

export const inputTheme = defineMultiStyleConfig({
  variants: { outlined },
})
