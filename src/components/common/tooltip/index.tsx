import { TooltipProps, Tooltip as ChakraTooltip } from '@chakra-ui/react'
import { borderRadius } from '@/styles'

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
    {children}
  </ChakraTooltip>
)
