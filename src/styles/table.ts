import { tableAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  tableAnatomy.keys
)

const baseStyle = definePartsStyle({
  tr: {
    'td:first-child': {
      borderTopLeftRadius: 'full',
      borderBottomLeftRadius: 'full',
    },
    'td:last-child': {
      borderTopRightRadius: 'full',
      borderBottomRightRadius: 'full',
    },
  },
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
      ...paragraphRegular,
      color: 'grey.500 !important',
      borderColor: 'grey.300 !important',
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
      borderColor: 'grey.300',
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
  tr: {
    'td:first-child': {
      borderTopLeftRadius: 'full',
      borderBottomLeftRadius: 'full',
    },
    'td:last-child': {
      borderTopRightRadius: 'full',
      borderBottomRightRadius: 'full',
    },
  },
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
      ...paragraphRegular,
      color: 'grey.500 !important',
      borderColor: 'grey.300 !important',
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
      borderBottomWidth: '1px',
      borderColor: 'grey.300 !important',
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
