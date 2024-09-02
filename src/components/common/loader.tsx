import LoadingIcon from '@/resources/icons/loader-icon.svg'
import React from 'react'
import '../../../src/app/style.css'
import { Box, BoxProps } from '@chakra-ui/react'

export interface ILoader extends Omit<BoxProps, 'children'> {
  loadingIconColor?: string | undefined
}

export default function Loader({ loadingIconColor, ...props }: ILoader) {
  return (
    <Box {...props} animation='rotateInfinite 1.4s linear 0s infinite normal none running'>
      <LoadingIcon width={16} height={16} color={loadingIconColor} />
    </Box>
  )
}
