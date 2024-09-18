import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import BlockIcon from '@/resources/icons/block.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface BlockedTradeTemplateProps {
  onClose: () => void
  message: string
}

export default function BlockedTradeTemplate({ onClose, message }: BlockedTradeTemplateProps) {
  return (
    <VStack w={'full'} h={'120px'}>
      <HStack w={'full'} justifyContent={'space-between'}>
        <Icon as={BlockIcon} width={'16px'} height={'16px'} color={'white'} />
        <Icon
          as={CloseIcon}
          width={'16px'}
          height={'16px'}
          color={'white'}
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
        />
      </HStack>
      <HStack w={'full'}>
        <Text {...paragraphMedium} color='white' textAlign={'left'} whiteSpace='normal'>
          {message}
        </Text>
        <Box w={'45px'}></Box>
      </HStack>
    </VStack>
  )
}
