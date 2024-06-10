import { useMediaQuery } from '@chakra-ui/react'

import { IPHONE14_PRO_MAX_WIDTH } from '@/constants/devices'

export const useIsMobile = () => {
  const [isMobile] = useMediaQuery(`(max-width: ${IPHONE14_PRO_MAX_WIDTH}px)`)
  return isMobile
}
