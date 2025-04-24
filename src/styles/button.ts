import { isMobile } from 'react-device-detect'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export const commonButtonProps = {
  height: isMobile ? '32px' : '24px',
  px: isMobile ? '12px' : '8px',
  gap: isMobile ? '8px' : '4px',
  borderRadius: '8px',
  border: 'unset',
  outline: 'none !important',
  _focus: {
    boxShadow: 'none !important',
  },
  _focusVisible: {
    boxShadow: 'none !important',
  },
  transitionProperty: 'none',
  transitionDuration: 'unset',
  WebkitTapHighlightColor: 'transparent',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  ...paragraphMedium,
}
