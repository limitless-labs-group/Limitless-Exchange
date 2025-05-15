import { checkboxAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  checkboxAnatomy.keys
)

const baseStyle = definePartsStyle({
  control: {
    w: '12px',
    h: '12px',
    border: '1px solid',
    borderColor: 'grey.300',
    borderRadius: '2px',
    color: 'grey.50',
    _focus: {
      boxShadow: 'unset',
    },
    _checked: {
      bg: 'grey.800 !important',
      border: 'unset',
      _hover: {
        border: 'unset',
      },
    },
  },
  container: {
    '& .chakra-checkbox__label': {
      ...paragraphMedium,
    },
  },
  icon: {
    w: '10px',
    h: '10px',
  },
  label: {
    marginLeft: '4px',
  },
})

const variants = {
  green: definePartsStyle({
    control: {
      _checked: {
        bg: 'green.500 !important',
        border: 'unset',
        _hover: {
          border: 'unset',
        },
      },
    },
  }),
}

export const checkboxTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
})
