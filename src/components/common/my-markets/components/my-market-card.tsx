import { Box, Divider, HStack, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import { useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { paragraphBold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus, UserCreatedMarket } from '@/types'
import { NumberUtil } from '@/utils'

type MyMarketCardProps = {
  market: UserCreatedMarket
}

export default function MyMarketCard({ market }: MyMarketCardProps) {
  const fullMarket = useMarket(market.address)
  const { onOpenMarketPage } = useTradingService()
  const statusText = useMemo(() => {
    switch (market.status) {
      case MarketStatus.RESOLVED:
        return 'Closed'
      case MarketStatus.PENDING:
        return 'In Review'
      case MarketStatus.FUNDED:
        return 'Live'
      default:
        return 'Locked'
    }
  }, [market.status])

  const statusColor = useMemo(() => {
    switch (market.status) {
      case MarketStatus.RESOLVED:
        return 'grey.500'
      case MarketStatus.PENDING:
        return 'yellow.500'
      case MarketStatus.FUNDED:
        return 'green.500'
      default:
        return 'grey.500'
    }
  }, [market.status])

  const formatMarketDeadline = () => {
    const date = new Date(market.deadline)
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
    const [month, day, year] = formattedDate.replace(',', '').split(' ')
    return `${month} ${day}, ${year}`
  }

  return (
    <Paper
      flex={1}
      w={'100%'}
      position='relative'
      cursor={market.status !== MarketStatus.PENDING ? 'pointer' : 'default'}
      p='14px'
    >
      <Box w='full'>
        <HStack w='full' justifyContent='space-between'>
          <DailyMarketTimer
            deadline={new Date(market.deadline).getTime()}
            deadlineText={formatMarketDeadline()}
            {...paragraphRegular}
            color='grey.500'
          />
          <HStack gap='4px'>
            <Box w='6px' h='6px' bg={statusColor} borderRadius='100%' />
            <Text {...paragraphRegular} color={statusColor}>
              {statusText}
            </Text>
          </HStack>
        </HStack>
        <Text {...paragraphBold} fontSize='16px' mt='12px'>
          {market.title}
        </Text>
      </Box>
      {market.status === MarketStatus.PENDING && (
        <Box w='full' mt='40px'>
          <HStack w='full' justifyContent='space-between' mb='4px'>
            <Text {...paragraphMedium} color={'grey.500'}>
              Yes {market.draftMetadata.initialProbability * 100}%
            </Text>
            <Text {...paragraphMedium} color={'grey.500'}>
              No {100 - market.draftMetadata.initialProbability * 100}%
            </Text>
          </HStack>
          <ProgressBar variant={'draft'} value={market.draftMetadata.initialProbability * 100} />
        </Box>
      )}
      <Divider my='16px' borderColor='grey.200' color='grey.200' />
      <HStack w='full' justifyContent='space-between'>
        <Box />
        <Text {...paragraphMedium} color='grey.500'>
          💧 Liquidity {NumberUtil.convertWithDenomination(market.draftMetadata.liquidity, 0)}{' '}
          {market.token.symbol}
        </Text>
      </HStack>
    </Paper>
  )
}
