import { radioAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  radioAnatomy.keys
)

const baseStyle = definePartsStyle({
  label: {
    marginInlineStart: '8px',
  },
  control: {
    borderRadius: '12px',
    borderColor: 'grey.800',

    _checked: {
      background: 'black!',
      borderColor: 'black!',
      '&:focus-visible': {
        boxShadow: 'unset!',
      },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'unset!',
      },
    },
    _focusVisible: {
      outline: 'none',
      boxShadow: 'unset!',
    },
  },
})

export const radioTheme = defineMultiStyleConfig({ baseStyle })
