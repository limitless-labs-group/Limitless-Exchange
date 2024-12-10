import { defineStyle, defineStyleConfig } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

const grey = defineStyle({
  border: '1px solid',
  borderRadius: '8px',
  borderColor: 'grey.300',
  px: isMobile ? '12px' : '8px',
  py: isMobile ? '8px' : '4px',
  h: isMobile ? '64px' : '56px',
  minH: 'unset',
  resize: 'none',
  bg: 'unset',
  ...paragraphMedium,
  color: 'grey.800',
  _hover: {
    borderColor: 'grey.400',
  },
  _focus: {
    borderColor: 'grey.800',
  },
  _placeholder: {
    ...paragraphMedium,
    color: 'grey.500',
  },
  _invalid: {
    borderColor: 'red.500',
  },
})

export const textAreaTheme = defineStyleConfig({
  variants: { grey },
})
