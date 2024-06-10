import type { BoxProps } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'
import { FaInfo } from 'react-icons/fa6'

import { colors } from '@/styles'

export const InfoIcon = ({ ...props }: BoxProps) => (
  <Box p={'2px'} borderRadius={'full'} border={'1px solid'} borderColor={'fontLight'} {...props}>
    <FaInfo size={(props.fontSize ?? '8px') as string} fill={colors.fontLight} />
  </Box>
)
