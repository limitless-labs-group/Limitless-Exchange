import { PropsWithChildren } from 'react'
import { Box } from '@chakra-ui/react'
import { useIsMobile } from '@/hooks'

export default function Paper({ children }: PropsWithChildren) {
  const isMobile = useIsMobile()
  return (
    <Box
      p={isMobile ? 0 : '20px'}
      borderColor={'#E7E7EA'}
      borderWidth={isMobile ? 0 : '1px'}
      borderRadius={'12px'}
    >
      {children}
    </Box>
  )
}
