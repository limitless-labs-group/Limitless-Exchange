import { tableAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { captionRegular, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

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

const grey = definePartsStyle({
  thead: {
    th: {
      padding: '8px 12px',
      ...paragraphMedium,
      color: 'grey.700',
      borderColor: 'grey.300 !important',
      bg: 'grey.100',
      textTransform: 'unset',
      '&:not(:last-child)': { borderRight: '1px solid', borderColor: 'grey.300' },
      borderBottom: '1px solid',
      '& p': {
        mb: 0,
        fontWeight: 500,
      },
      whiteSpace: isMobile ? 'nowrap' : 'normal',
    },
  },
  tbody: {
    tr: {
      '&:not(:last-child)': {
        td: {
          borderColor: 'grey.300 !important',
          borderBottom: '1px solid',
        },
      },
      '&:last-child': {
        td: {
          borderBottom: 'unset',
        },
      },
    },
    td: {
      ...captionRegular,
      color: 'grey.700',
      '&:not(:last-child)': { borderRight: '1px solid', borderColor: 'grey.300' },
      padding: isMobile ? '12px' : '7.5px 8px',
      '& p': {
        mb: 0,
      },
      whiteSpace: isMobile ? 'nowrap' : 'normal',
    },
  },
})

export const tableTheme = defineMultiStyleConfig({
  baseStyle,
  variants: { noPaddingsOnSides, grey },
})
