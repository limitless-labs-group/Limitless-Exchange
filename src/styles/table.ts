import { tableAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  tableAnatomy.keys
)

const baseStyle = definePartsStyle({
  th: {
    '&[data-is-numeric=true]': {},
    fontFamily: 'Inter, sans-serif',
  },
  td: {
    '&[data-is-numeric=true]': {
      textAlign: 'start',
    },
  },
  thead: {
    th: {
      padding: isMobile ? '12px' : '8px',
      ...paragraphMedium,
      color: 'grey.500 !important',
      borderColor: 'grey.200 !important',
      textTransform: 'unset',
      '&[data-is-numeric=true]': {
        textAlign: 'start',
      },
      bg: 'unset',
    },
  },
  tbody: {
    td: {
      ...paragraphRegular,
      borderBottomWidth: '1px',
      borderColor: 'grey.200',
      padding: isMobile ? '12px' : '7.5px 8px',
      '&[data-is-numeric=true]': {
        textAlign: 'start',
      },
    },
  },
  tfoot: {
    tr: {
      '&:last-of-type': {
        th: { borderBottomWidth: 0 },
      },
    },
  },
})

const noPaddingsOnSides = definePartsStyle({
  th: {
    '&[data-is-numeric=true]': {},
    fontFamily: 'Inter, sans-serif',
  },
  td: {
    '&[data-is-numeric=true]': {
      textAlign: 'start',
    },
  },
  thead: {
    th: {
      padding: isMobile ? '12px' : '8px',
      ...paragraphMedium,
      color: 'grey.500',
      borderColor: 'grey.200',
      textTransform: 'unset',
      '&[data-is-numeric=true]': {
        textAlign: 'end',
      },
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
        textAlign: 'end',
      },
      borderBottom: '1px solid',
    },
  },
  tbody: {
    td: {
      ...paragraphRegular,
      borderBottomWidth: '0px',
      padding: isMobile ? '12px' : '7.5px 8px',
      '&[data-is-numeric=true]': {
        textAlign: 'start',
      },
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
      },
    },
  },
  tfoot: {
    tr: {
      '&:last-of-type': {
        th: { borderBottomWidth: 0 },
      },
    },
  },
})

export const tableTheme = defineMultiStyleConfig({
  baseStyle,
  variants: { noPaddingsOnSides },
})
