import { Box, HStack, Text } from '@chakra-ui/react'
import { MarketTimerProps } from '@/components/common/markets'
import MarketTimer from '@/components/common/markets/market-cards/market-timer'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

export default function MarketCountdown(params: MarketTimerProps) {
  const isEnded = new Date(params.deadline).getTime() < new Date().getTime()
  return isEnded ? (
    <HStack gap='4px'>
      <Box w='12px' h='12px' borderRadius='full' bg='grey.500' />
      <Text {...paragraphRegular} color='grey.500'>
        Ended
      </Text>
    </HStack>
  ) : (
    <MarketTimer {...params} />
  )
}
