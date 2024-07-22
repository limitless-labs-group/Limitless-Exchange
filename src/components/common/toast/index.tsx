import { Box, BoxProps, Link, Text, VStack } from '@chakra-ui/react'

interface IToast extends BoxProps {
  title?: string
  text?: string
  link?: string
}

export const Toast = ({ title, text, link, children, ...props }: IToast) => (
  <Box bg='blue.500' color={'grey.50'} p='4px' borderRadius='2px' {...props}>
    <VStack w={'full'} alignItems={'start'} spacing={1}>
      {title && (
        <Text fontWeight={'bold'}>
          {title}{' '}
          {link && text && (
            <Link href={link} isExternal>
              {text}
            </Link>
          )}{' '}
        </Text>
      )}
      {children}
    </VStack>
  </Box>
)
