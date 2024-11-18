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
          bg: 'grey.400',
          textDecoration: 'none',
        },
      }),
})

const textLink = defineStyle({
  ...paragraphMedium,
  textDecoration: 'none',
  background: 'unset',
  borderBottom: '1px solid',
  borderColor: 'blackTransparent.200',
  ...(isMobile
    ? {}
    : {
        _hover: {
          bg: 'grey.200',
          textDecoration: 'none',
          borderColor: 'blackTransparent.600',
          background: 'unset',
        },
      }),
})

const textLinkSecondary = defineStyle({
  ...paragraphMedium,
  textDecoration: 'none',
  background: 'unset',
  borderBottom: '1px solid',
  borderColor: 'greyTransparent.200',
  color: 'grey.500',
  ...(isMobile
    ? {}
    : {
        _hover: {
          textDecoration: 'none',
          borderColor: 'greyTransparent.600',
          background: 'unset',
        },
      }),
})

export const linkTheme = defineStyleConfig({
  variants: { transparent, textLink, textLinkSecondary },
})
