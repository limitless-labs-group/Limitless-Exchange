import { Box, Button, HStack, Text, ToastId, VStack } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { useToast } from '@/hooks'
import { PropsWithChildren } from 'react'
import CloseIcon from '@/resources/icons/close-icon.svg'

interface IToast {
  title: string
  id: ToastId
  text?: string
}

export const Toast = ({ title, text, id, children }: PropsWithChildren<IToast>) => {
  const toast = useToast()
  function close() {
    toast.close(id)
  }
  return (
    <Box
      bg='grey.200'
      color={'grey.800'}
      p='12px'
      borderRadius='2px'
      minW={isMobile ? 'calc(100vw - 16px)' : '296px'}
      mt={isMobile ? '4px' : '24px'}
      mr={isMobile ? 0 : '8px'}
    >
      <HStack justifyContent='space-between'>
        <Text {...headline}>{title}</Text>
        <Button variant='transparent' onClick={close} p={0} minW='unset' h='unset'>
          <CloseIcon width={16} height={16} />
        </Button>
      </HStack>
      <VStack w={'full'} alignItems={'start'} spacing={1}>
        {text && (
          <Text {...paragraphRegular} mt={isMobile ? '16px' : '8px'}>
            {text}
          </Text>
        )}
        {children}
      </VStack>
    </Box>
  )
}
