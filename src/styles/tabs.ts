import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { isMobile } from 'react-device-detect' // import utility to set light and dark mode props

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

// define a custom variant
const common = definePartsStyle((props) => {
  const { colorScheme: c } = props // extract colorScheme from component props

  return {
    tab: {
      ...paragraphMedium,
      padding: isMobile ? '8px 12px' : '4px 8px',
      color: 'grey.500',
      borderBottom: 'none',
      _selected: {
        bg: mode('#fff', 'gray.800')(props),
        color: 'grey.800',
        borderColor: 'inherit',
        borderBottom: 'none',
      },
    },
    tablist: {
      borderBottom: '1px solid',
      borderColor: 'grey.500',
    },
    tabpanel: {
      marginTop: isMobile ? 0 : '4px',
      borderBottomRadius: 'lg',
      borderTopRightRadius: 'lg',
      p: 0,
    },
  }
})

const variants = {
  common,
}

// export the component theme
export const tabsTheme = defineMultiStyleConfig({ variants })
