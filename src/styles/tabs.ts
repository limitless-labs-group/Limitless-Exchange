import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { paragraphBold, paragraphMedium } from '@/styles/fonts/fonts.styles'

// import utility to set light and dark mode props

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

// define a custom variant
const common = definePartsStyle(() => {
  return {
    root: {
      overflowX: 'auto',
    },
    tab: {
      ...paragraphMedium,
      padding: isMobile ? '8px 12px' : '4px 8px',
      color: 'grey.500',
      _selected: {
        color: 'grey.800',
        borderColor: 'inherit',
        borderBottom: 'none',
      },
      borderBottom: 'unset',
      borderColor: 'grey.500',
    },
    tablist: {
      borderBottom: isMobile ? 'unset' : '1px solid',
      borderColor: 'grey.100',
    },
    tabpanel: {
      marginTop: isMobile ? 0 : '4px',
      borderBottomRadius: 'lg',
      borderTopRightRadius: 'lg',
      p: 0,
    },
  }
})

const transparent = definePartsStyle(() => {
  return {
    root: {
      overflowX: 'auto',
    },
    tab: {
      ...paragraphBold,
      padding: 0,
      color: 'grey.500',
      _selected: {
        color: 'grey.800',
        borderColor: 'inherit',
        borderBottom: 'none',
      },
      borderBottom: 'unset',
    },
    tablist: {
      gap: '8px',
    },
    tabpanel: {
      p: 0,
      mt: '12px',
    },
  }
})

const variants = {
  common,
  transparent,
}

// export the component theme
export const tabsTheme = defineMultiStyleConfig({ variants })
