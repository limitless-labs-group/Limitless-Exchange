import { Box, BoxProps } from '@chakra-ui/react'
import React from 'react'
import LoadingIcon from '@/resources/icons/loader-icon.svg'
import '../../../src/app/style.css'

export type LoaderSizes = 'sm' | 'md' | 'lg'

export interface ILoader extends Omit<BoxProps, 'children'> {
  loadingIconColor?: string | undefined
  size?: LoaderSizes
}

export default function Loader({ loadingIconColor, size = 'sm', ...props }: ILoader) {
  const getSize = (size: LoaderSizes) => {
    switch (size) {
      case 'lg':
        return { w: 32, h: 32 }
      case 'md':
        return { w: 24, h: 24 }
      default:
        return { w: 16, h: 16 }
    }
  }
  const dim = getSize(size)
  return (
    <Box {...props} animation='rotateInfinite 1.4s linear 0s infinite normal none running'>
      <LoadingIcon width={dim.w} height={dim.h} color={loadingIconColor} />
    </Box>
  )
}
