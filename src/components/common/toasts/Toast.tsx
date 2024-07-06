import { Box, BoxProps, Text, VStack } from '@chakra-ui/react'

interface IToast extends BoxProps {
  title?: string
  text?: string
}

export const Toast = ({ title, text, children, ...props }: IToast) => (
  <Box bg='blue.500' color={'white'} p='4px' borderRadius='2px' {...props}>
    <VStack w={'full'} alignItems={'start'} spacing={1}>
      {title && <Text fontWeight={'bold'}>{title}</Text>}
      {text && <Text>{text}</Text>}
      {children}
    </VStack>
  </Box>
)
