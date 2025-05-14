import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

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

const blue = {
  ...baseStyle,
  separator: {
    ...baseStyle.separator,
    '[data-status=complete] &': {
      bg: 'blue.500',
      opacity: 0.5,
    },
    '[data-orientation=vertical] &': {
      h: 'calc(100% - 10px)',
      top: '20px',
      left: '7.5px',
      maxHeight: 'unset',
      w: '1px',
    },
  },
  title: {
    ...paragraphMedium,
  },
}

export const stepperTheme = {
  baseStyle,
  variants: { blue },
}
