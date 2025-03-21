import { Box, BoxProps } from '@chakra-ui/react'
import { LegacyRef, PropsWithChildren } from 'react'
import { isMobile } from 'react-device-detect'

export default function Paper({
  children,
  ...props
}: PropsWithChildren<BoxProps & { ref?: LegacyRef<HTMLDivElement> }>) {
  return (
    <Box bg='grey.50' rounded='12px' p={isMobile ? '16px' : '8px'} {...props}>
      {children}
    </Box>
  )
}
