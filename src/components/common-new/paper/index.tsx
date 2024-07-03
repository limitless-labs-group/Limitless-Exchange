import { PropsWithChildren } from 'react'
import { Box, BoxProps } from '@chakra-ui/react'

export default function Paper({ children, ...props }: PropsWithChildren<BoxProps>) {
  return (
    <Box bg='grey.200' rounded='2px' p='8px' {...props}>
      {children}
    </Box>
  )
}
