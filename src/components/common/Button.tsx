import { borderRadius } from '@/styles'
import { ButtonProps, Button as ChakraButton } from '@chakra-ui/react'
export interface IButton extends ButtonProps {
  colorScheme?: 'brand' | 'neural' | 'transparent'
}

export const Button = ({ children, colorScheme = 'neural', ...props }: IButton) => (
  <ChakraButton
    h={'48px'}
    className={colorScheme}
    colorScheme='blackAlpha'
    bg={colorScheme == 'brand' ? 'brand' : colorScheme == 'neural' ? 'bgLight' : 'transparent'}
    color={colorScheme == 'brand' ? 'white' : 'text'}
    borderRadius={borderRadius}
    fontSize={'14px'}
    // px={4}
    gap={0}
    alignItems={'center'}
    // fontWeight={'normal'}
    overflow={'hidden'}
    _hover={{
      bg: props.bg ?? (colorScheme == 'brand' ? 'brand' : 'bgLight'),
      // transform: 'scale(1.01)',
    }}
    _active={{
      bg: props.bg ?? (colorScheme == 'brand' ? 'brand' : 'bgLight'),
      // transform: 'scale(0.99)',
    }}
    {...props}
  >
    {children}
  </ChakraButton>
)
