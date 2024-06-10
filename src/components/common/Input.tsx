import { borderRadius } from '@/styles';
import { Input as ChakraInput, InputProps } from '@chakra-ui/react';

export const Input = ({ ...props }: InputProps) => (
  <ChakraInput
    borderRadius={borderRadius}
    outline={'none'}
    // border={'none'}
    bg={'transparent'}
    fontSize={'16px'}
    color={'text'}
    h={'60px'}
    _placeholder={{ color: 'fontLight' }}
    {...props}
  />
);
