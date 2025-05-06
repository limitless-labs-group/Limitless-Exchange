import { extendTheme as ChakraTheme, ThemeConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { Inter } from 'next/font/google'
import { isMobile } from 'react-device-detect'
import { accordionTheme } from '@/styles/accordion'
import { commonButtonProps } from '@/styles/button'
import { checkboxTheme } from '@/styles/checkbox'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { inputTheme } from '@/styles/input'
import { linkTheme } from '@/styles/link'
import { menuTheme } from '@/styles/menu'
import { modalTheme } from '@/styles/modals'
import { numberInputTheme } from '@/styles/number-input'
import { radioTheme } from '@/styles/radio'
import { selectTheme } from '@/styles/select'
import { skeletonTheme } from '@/styles/skeleton'
import { sliderTheme } from '@/styles/slider'
import { stepperTheme } from '@/styles/stepper'
import { tableTheme } from '@/styles/table'
import { tabsTheme } from '@/styles/tabs'
import { textAreaTheme } from '@/styles/text-area'
import { tooltipTheme } from '@/styles/tooltip'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export const borderRadius = 'lg'

export const chakraTheme = ChakraTheme({
  ...config,
  fonts: {
    heading: inter.style.fontFamily,
    body: inter.style.fontFamily,
  },
  // colors: mode(lightThemeColors, darkThemeColors)((props) => props),
  styles: {
    global: {
      html: {
        scrollbarWidth: 'none' /* Firefox */,
        '-ms-overflow-style': 'none' /* IE and Edge */,
        '&::-webkit-scrollbar': {
          display: 'none' /* Chrome, Safari, Opera */,
          width: '0px',
          background: 'transparent',
        },
      },
      '.infinite-scroll-component__outerdiv': {
        width: '100%',
      },
      '*:focus': {
        outline: 'none !important',
        boxShadow: 'none !important',
      },
      body: {
        overflowX: 'hidden',
        userSelect: 'text',
        color: 'grey.800',
        background: 'grey.50',
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
        translate: 'none',
      },
      span: {
        translate: 'none',
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
      '.w3a-header__subtitle': {
        color: 'grey.500 !important',
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
        color: 'blue.500 !important',
      },
      '#w3a-modal button, #w3a-modal input, #w3a-modal canvas': {
        borderRadius: `2px !important`,
        // border: 'none !important',
      },
      '.w3ajs-external-toggle__button': {
        background: `blue.500 !important`,
        color: 'white !important',
        fontWeight: 'bold !important',
      },
      '#w3a-modal .w3a-header__logo img, #w3a-modal .w3a-modal__loader-app-logo img': {
        filter: 'invert()',
        borderRadius: '50% !important',
      },
      '.w3a-parent-container #w3a-modal .t-btn.t-btn-secondary': {
        background: 'grey.300',
        color: 'grey.800',
        border: 'unset',
        _hover: {
          background: 'grey.400',
        },
      },
      '.w3a-social__policy': {
        color: 'grey.800 !important',
      },
      '.w3ajs-button-expand-text': {
        color: 'blue.100 !important',
      },
      '.w3a-text-field': {
        backgroundColor: 'unset !important',
        color: 'grey.800 !important',
        borderColor: 'whiteAlpha.20 !important',
        borderRadius: '8px solid',
        _hover: {
          borderColor: 'whiteAlpha.70 !important',
        },
        _focus: {
          borderColor: 'grey.800 !important',
        },
      },
    },
  },
  zIndices: {
    tooltip: 3000,
  },
  components: {
    Button: {
      baseStyle: {
        fontSize: '14px',
        py: '4px',
        px: '8px',
        fontWeight: 500,
        gap: '4px',
        outline: 'none !important',
        _disabled: {
          opacity: 1,
          pointerEvents: 'none',
        },
      },
      variants: {
        outlined: {
          ...commonButtonProps,
          h: '26px',
          bg: 'unset',
          color: 'grey.800',
          border: '1px solid',
          borderColor: 'grey.200',
          _disabled: {
            color: 'grey.500',
            bg: 'grey.300',
          },
          _hover: {
            bg: 'grey.100',
          },
        },
        contained: {
          ...commonButtonProps,
          bg: 'blue.500',
          color: 'white',
          ...(isMobile
            ? {}
            : {
                _hover: {
                  bg: 'blue.600',
                },
              }),
          _disabled: {
            bg: 'grey.300 !important',
            color: 'grey.500',
            pointerEvents: 'none',
          },
        },
        white: (props: Record<string, unknown>) => ({
          ...commonButtonProps,
          h: '26px',
          border: mode('1px solid', 'none')(props),
          borderColor: mode('grey.200', 'transparent')(props),
          boxShadow: '0px 1px 4px 0px rgba(2, 6, 23, 0.05)',
          px: isMobile ? '12px' : '8px',
          bg: 'white',
          color: 'black',
          _hover: {
            bg: 'white',
          },
          _disabled: {
            bg: 'grey.300',
            color: 'grey.500',
            pointerEvents: 'none',
          },
        }),
        grey: {
          ...commonButtonProps,
          bg: 'grey.300',
          ...(isMobile
            ? {}
            : {
                _hover: {
                  bg: 'grey.400',
                },
              }),
          _disabled: {
            bg: 'grey.300',
            color: 'grey.500',
            pointerEvents: 'none',
          },
        },
        black: {
          ...commonButtonProps,
          bg: 'black',
          color: 'white',
          ...(isMobile
            ? {}
            : {
                _hover: {
                  bg: 'black',
                },
              }),
        },
        dashed: {
          ...commonButtonProps,
          bg: 'unset',
          color: 'grey.800',
          gap: '8px',
          border: '1px dashed',
          borderColor: 'blackAlpha.20',
        },
        transparent: {
          background: 'unset',
          ...commonButtonProps,
          px: '8px',
          gap: '4px',
          ...(isMobile
            ? {}
            : {
                _hover: {
                  bg: 'grey.200',
                },
              }),
        },
        transparentLight: {
          ...commonButtonProps,
          bg: 'whiteAlpha.20',
          p: isMobile ? '8px 12px' : '4px 8px',
          height: 'unset',
          ...(isMobile
            ? {}
            : {
                _hover: {
                  bg: 'whiteAlpha.30',
                },
              }),
        },
        transparentGray: {
          ...commonButtonProps,
          ...paragraphRegular,
          color: 'grey.900',
          bg: 'grey.200',
          borderRadius: '8px',
          py: '2px',
          px: '10px',
          height: 'unset',
          _hover: {
            bg: 'grey.300',
          },
        },
        transparentGreyText: {
          ...commonButtonProps,
          bg: 'unset',
          px: '16px',
          height: 'unset',
          color: 'grey.500',
          alignItems: 'center',
          _hover: {
            color: 'grey.800',
          },
          _disabled: {
            opacity: 0.5,
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: '14px',
      },
    },
    Textarea: textAreaTheme,
    HStack: {
      spacing: '8px',
    },
    Radio: radioTheme,
    Modal: modalTheme,
    Accordion: accordionTheme,
    Input: inputTheme,
    NumberInput: numberInputTheme,
    Menu: menuTheme,
    Checkbox: checkboxTheme,
    Link: linkTheme,
    Table: tableTheme,
    Skeleton: skeletonTheme,
    Tabs: tabsTheme,
    Tooltip: tooltipTheme,
    Divider: {
      baseStyle: {
        borderColor: 'grey.100',
        bg: 'grey.100',
      },
      variants: {
        dark: {
          borderColor: 'grey.200',
          bg: 'grey.200',
        },
        transparent: {
          borderColor: 'whiteAlpha.20',
          bg: 'whiteAlpha.20',
        },
      },
    },
    Slider: sliderTheme,
    Select: selectTheme,
    Stepper: stepperTheme,
    Progress: {
      baseStyle: {
        track: {
          borderRadius: '8px',
        },
      },
      variants: {
        white: {
          filledTrack: {
            bg: 'white',
          },
          track: {
            bg: 'whiteAlpha.20',
          },
        },
        green: {
          filledTrack: {
            bg: 'var(--chakra-colors-green-500)',
            height: '4px',
          },
          track: {
            bg: 'var(--chakra-colors-grey-300)',
            height: '4px',
          },
        },
        greenAndWhiteTrack: {
          filledTrack: {
            bg: 'var(--chakra-colors-green-500)',
            height: '4px',
          },
          track: {
            bg: 'var(--chakra-colors-white)',
            height: '4px',
          },
        },
        yellow: {
          filledTrack: {
            bg: 'var(--chakra-colors-orange-500)',
            height: '4px',
          },
          track: {
            bg: 'var(--chakra-colors-grey-300)',
            height: '4px',
          },
        },
        yellowAndWhiteTrack: {
          filledTrack: {
            bg: 'var(--chakra-colors-orange-500)',
            height: '4px',
          },
          track: {
            bg: 'var(--chakra-colors-white)',
            height: '4px',
          },
        },
        red: {
          filledTrack: {
            bg: 'var(--chakra-colors-red-500)',
            height: '4px',
          },
          track: {
            bg: 'var(--chakra-colors-grey-300)',
            height: '4px',
          },
        },
        redAndWhiteTrack: {
          filledTrack: {
            bg: 'var(--chakra-colors-red-500)',
            height: '4px',
          },
          track: {
            bg: 'var(--chakra-colors-white)',
            height: '4px',
          },
        },
        market: {
          filledTrack: {
            bg: '#0FC591',
          },
          track: {
            bg: '#FF3756',
          },
        },
        draft: {
          filledTrack: {
            bg: 'grey.400',
          },
          track: {
            bg: 'grey.200',
          },
        },
      },
    },
  },
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '1023px',
    xl: '1200px',
    xxl: '1400px',
  },
})
