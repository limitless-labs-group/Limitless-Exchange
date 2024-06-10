import { IPHONE14_PRO_MAX_WIDTH } from '@/constants/devices';
import { useMediaQuery } from '@chakra-ui/react';

export const useIsMobile = () => {
  const [isMobile] = useMediaQuery(`(max-width: ${IPHONE14_PRO_MAX_WIDTH}px)`);
  return isMobile;
};
