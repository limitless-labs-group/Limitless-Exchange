import { defineStyle, defineStyleConfig } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { commonButtonProps } from '@/styles/button'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

const transparent = defineStyle({
  ...commonButtonProps,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  background: 'unset',
  px: '8px',
  gap: '8px',
  ...(isMobile
    ? {}
    : {
        _hover: {
          bg: 'grey.200',
          textDecoration: 'none',
        },
      }),
})

const textLink = defineStyle({
  ...paragraphMedium,
  textDecor: 'none',
  background: 'unset',
  borderBottom: '1px solid',
  borderColor: 'blackTransparent.200',
  ...(isMobile
    ? {}
    : {
        _hover: {
          bg: 'grey.200',
          textDecor: 'none',
          borderColor: 'blackTransparent.600',
          background: 'unset',
        },
      }),
})

export const linkTheme = defineStyleConfig({
  variants: { transparent, textLink },
})
