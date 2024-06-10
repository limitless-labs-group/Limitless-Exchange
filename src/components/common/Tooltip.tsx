import { borderRadius } from '@/styles';
import { TooltipProps, Tooltip as ChakraTooltip, Box } from '@chakra-ui/react';

export const Tooltip = ({ children, ...props }: TooltipProps) => (
  <ChakraTooltip
    bg={'bg'}
    color={'font'}
    fontWeight={'normal'}
    border={'1px solid'}
    borderColor={'border'}
    borderRadius={borderRadius}
    px={3}
    py={2}
    {...props}
  >
    <Box>{children}</Box>
  </ChakraTooltip>
);
