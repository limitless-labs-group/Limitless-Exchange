import { defineStyle, defineStyleConfig } from '@chakra-ui/react'
import { commonButtonProps } from '@/styles/button'
import { isMobile } from 'react-device-detect'

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

export const linkTheme = defineStyleConfig({
  variants: { transparent },
})
