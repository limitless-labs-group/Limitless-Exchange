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
  _hover: {
    bg: 'grey.100',
    textDecoration: 'none',
  },
})

const blueLink = defineStyle({
  ...commonButtonProps,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  background: 'blue.500',
  px: '8px',
  gap: '8px',
})

const textLink = defineStyle({
  ...paragraphMedium,
  textDecoration: 'none',
  background: 'unset',
  borderBottom: '1px solid',
  borderColor: 'transparent.20',
  ...(isMobile
    ? {}
    : {
        _hover: {
          bg: 'grey.100',
          borderColor: 'transparent.70',
          background: 'unset',
        },
      }),
})

const textLinkSecondary = defineStyle({
  ...paragraphMedium,
  background: 'unset',
  textDecoration: 'underline',
  textDecorationColor: 'greyTransparent.200',
  color: 'grey.500',
  ...(isMobile
    ? {}
    : {
        _hover: {
          textDecorationColor: 'greyTransparent.600',
          background: 'unset',
        },
      }),
})

export const linkTheme = defineStyleConfig({
  variants: { transparent, textLink, textLinkSecondary, blueLink },
})
