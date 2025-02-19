import { paragraphRegular } from '@/styles/fonts/fonts.styles'

const baseStyle = {
  indicator: {
    w: '16px',
    h: '16px',
    '[data-status=complete] &': {
      bg: 'unset',
    },
    '[data-status=active] &': {
      bg: 'unset',
      border: 'unset',
    },
    '[data-status=incomplete] &': {
      border: 'unset',
    },
  },
  step: {
    alignItems: 'center',
    w: 'full',
  },
  title: {
    ...paragraphRegular,
    color: 'grey.500',
    '[data-status=active] &': {
      color: 'grey.800',
    },
  },
  separator: {
    bg: 'grey.400',
    '[data-status=complete] &': {
      bg: 'grey.400',
    },
    '[data-orientation=vertical] &': {
      h: '28px',
      top: '17px',
      left: '7px',
      maxHeight: 'unset',
    },
  },
}

export const stepperTheme = {
  baseStyle,
}
