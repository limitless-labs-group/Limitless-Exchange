import { defineStyle, defineStyleConfig, cssVar } from '@chakra-ui/react'

const $startColor = cssVar('skeleton-start-color')
const $endColor = cssVar('skeleton-end-color')

const common = defineStyle({
  _light: {
    [$startColor.variable]: 'colors.grey.800',
    [$endColor.variable]: 'colors.grey.600',
  },
  _dark: {
    [$startColor.variable]: 'colors.grey.800',
    [$endColor.variable]: 'colors.grey.600',
  },
})
export const skeletonTheme = defineStyleConfig({
  variants: { common },
})
