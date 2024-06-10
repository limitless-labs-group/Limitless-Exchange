import { colors } from '@/styles';
import { Box, BoxProps } from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';

export const InfoIcon = ({ ...props }: BoxProps) => (
  <Box p={'2px'} borderRadius={'full'} border={'1px solid'} borderColor={'fontLight'} {...props}>
    <FaInfo size={(props.fontSize ?? '8px') as string} fill={colors.fontLight} />
  </Box>
);
