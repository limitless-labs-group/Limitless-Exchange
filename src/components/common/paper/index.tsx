import { Box, BoxProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { isMobile } from 'react-device-detect'

export default function Paper({ children, ...props }: PropsWithChildren<BoxProps>) {
  return (
    <Box bg='grey.200' rounded='2px' p={isMobile ? '16px' : '8px'} {...props}>
      {children}
    </Box>
  )
}
