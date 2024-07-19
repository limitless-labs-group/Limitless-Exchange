import { extendTheme as ChakraTheme, ThemeConfig } from '@chakra-ui/react'
import { radioTheme } from '@/styles/radio'
import { lightThemeColors } from '@/styles/light-theme-colors'
import { modalTheme } from '@/styles/modals'
import { accordionTheme } from '@/styles/accordion'
import { inputTheme } from '@/styles/input'
import { menuTheme } from '@/styles/menu'
import { commonButtonProps } from '@/styles/button'
import { checkboxTheme } from '@/styles/checkbox'

const fonts = `Helvetica Neue`
const pixels = 'Neue Pixel Sans'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

export const borderRadius = 'lg'

export const chakraTheme = ChakraTheme({
  ...config,
  fonts: {
    heading: pixels,
    body: fonts,
  },
  colors: lightThemeColors,
  styles: {
    global: {
      body: {
        overflowX: 'hidden',
        userSelect: 'none',
        color: 'grey.800',
        background: 'grey.100',
        fontSize: '14px',
      },
      hr: {
        opacity: '1 !important',
      },
      div: {
        '::-webkit-scrollbar': {
          display: 'none',
        },
      },
      p: {
        translate: 'no',
      },
      span: {
        translate: 'no',
      },
      button: {
        fontSize: '14px',
      },
      '.chakra-switch__track': {
        '--switch-bg': 'grey  !important',
        _checked: {
          '--switch-bg': `#2492ff !important`,
        },
      },

      // w3a modal styling
      '#w3a-modal': { backdropFilter: 'blur(5px)' },
      '.w3a-modal__inner, .w3a-modal__loader, .w3a-modal__footer, .w3a-wallet-connect__container': {
        bg: `grey.100 !important`,
        color: `grey.800 !important`,
        border: 'none !important',
        borderRadius: `${borderRadius} !important`,
      },
      '.w3a-header': {
        paddingTop: '10px !important',
      },
      '.w3a-header__logo': {
        display: 'none !important',
      },
      '.w3a-header__button': {
        right: '20px !important',
      },
      '.w3a-modal__content, .w3a-modal__header': {
        padding: '10px 20px !important',
      },
      '.w3a-modal__inner': {
        boxShadow: '0 0 30px #ddd !important',
        minHeight: '600px !important',
        maxWidth: '420px !important',
      },
      '.w3a-group__title, .w3a-header__title': {
        color: `grey.800 !important`,
      },
      '.w3a-button-expand': {
        color: `#2492ff !important`,
      },
      '#w3a-modal button, #w3a-modal input, #w3a-modal canvas': {
        borderRadius: `${borderRadius} !important`,
        // border: 'none !important',
      },
      '.w3ajs-external-toggle__button': {
        background: `#2492ff !important`,
        color: 'white !important',
        fontWeight: 'bold !important',
      },
      '#w3a-modal .w3a-header__logo img, #w3a-modal .w3a-modal__loader-app-logo img': {
        filter: 'invert()',
        borderRadius: '50% !important',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontSize: '14px',
        py: '4px',
        px: '8px',
        fontWeight: 500,
        gap: '4px',
        borderRadius: '2px',
        _disabled: {
          opacity: 1,
          pointerEvents: 'none',
        },
        _focus: {
          boxShadow: 'unset',
        },
        '&:focus-visible': {
          boxShadow: 'unset',
        },
      },
      variants: {
        outline: {
          borderWidth: 0,
          bg: 'grey.100',
          color: 'black',
          height: '52px',
        },
        contained: {
          ...commonButtonProps,
          bg: 'blue.500',
          color: 'grey.50',
          _hover: {
            bg: 'blue.600',
          },
          _disabled: {
            bg: 'grey.300',
            color: 'grey.500',
            pointerEvents: 'none',
          },
        },
        white: {
          ...commonButtonProps,
          bg: 'grey.50',
          color: 'grey.800',
          _hover: {
            bg: 'grey.50',
          },
          _disabled: {
            bg: 'grey.300',
            color: 'grey.500',
            pointerEvents: 'none',
          },
        },
        grey: {
          ...commonButtonProps,
          bg: 'grey.300',
          _hover: {
            bg: 'grey.400',
          },
          _disabled: {
            bg: 'grey.300',
            color: 'grey.500',
            pointerEvents: 'none',
          },
        },
        transparent: {
          background: 'unset',
          ...commonButtonProps,
          px: '8px',
          gap: '8px',
          _hover: {
            bg: 'grey.200',
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: '14px',
      },
    },
    Textarea: {
      baseStyle: {
        fontSize: '16px',
      },
    },
    HStack: {
      spacing: '8px',
    },
    Radio: radioTheme,
    Modal: modalTheme,
    Accordion: accordionTheme,
    Input: inputTheme,
    Menu: menuTheme,
    Checkbox: checkboxTheme,
  },
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '1023px',
    xl: '1200px',
    xxl: '1400px',
  },
})
