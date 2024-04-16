import { extendTheme as ChakraTheme } from '@chakra-ui/react'

const fonts = `Inter, sans-serif`
export const colors = {
  brand: '#2492ff',
  bg: 'white',
  bgLight: '#f5f5f5',
  border: '#ddd',
  font: '#0F172A',
  fontLight: '#747675',
  green: '#48CB9A',
  red: '#EF5D5D',
  black: '#0F172A',
}

export const borderRadius = 'lg'

export const chakraTheme = ChakraTheme({
  initialColorMode: 'light',
  useSystemColorMode: false,
  fonts: {
    heading: fonts,
    body: fonts,
  },
  colors,
  styles: {
    global: {
      body: {
        overflowX: 'hidden',
        userSelect: 'none',
        color: colors.font,
        background: colors.bg,
        fontSize: '14px',
      },
      button: {
        fontSize: '14px',
      },
      '.chakra-switch__track': {
        '--switch-bg': 'grey  !important',
        _checked: {
          '--switch-bg': `${colors.brand} !important`,
        },
      },

      // w3a modal styling
      '#w3a-modal': { backdropFilter: 'blur(5px)' },
      '.w3a-modal__inner, .w3a-modal__loader, .w3a-modal__footer, .w3a-wallet-connect__container': {
        bg: `${colors.bg} !important`,
        color: `${colors.font} !important`,
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
        color: `${colors.font} !important`,
      },
      '.w3a-button-expand': {
        color: `${colors.brand} !important`,
      },
      '#w3a-modal button, #w3a-modal input, #w3a-modal canvas': {
        borderRadius: `${borderRadius} !important`,
        // border: 'none !important',
      },
      '.w3ajs-external-toggle__button': {
        background: `${colors.brand} !important`,
        color: 'white !important',
        fontWeight: 'bold !important',
      },
      '#w3a-modal .w3a-header__logo img, #w3a-modal .w3a-modal__loader-app-logo img': {
        filter: 'invert()',
        borderRadius: '50% !important',
      },
    },
    components: {
      Button: {
        baseStyle: {
          fontSize: '14px',
        },
      },
      HStack: {
        spacing: '8px',
      },
    },
  },
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '1000px',
    xl: '1200px',
    xxl: '1400px',
  },
})
