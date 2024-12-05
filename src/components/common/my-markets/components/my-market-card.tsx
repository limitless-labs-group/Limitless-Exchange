import { Box, Divider, HStack, Text } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import { paragraphBold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

type MyMarketCardProps = {
  market: Market
}

export default function MyMarketCard({ market }: MyMarketCardProps) {
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

  return (
    <Paper flex={1} w={'100%'} position='relative' cursor='pointer' p='14px'>
      <Box w='full'>
        <HStack w='full' justifyContent='space-between'>
          <DailyMarketTimer
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
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
      <Box w='full' mt='40px'>
        <HStack w='full' justifyContent='space-between' mb='4px'>
          <Text
            {...paragraphMedium}
            color={market.status === MarketStatus.FUNDED ? '#0FC591' : 'grey.500'}
          >
            Yes {market?.prices[0]}%
          </Text>
          <Text
            {...paragraphMedium}
            color={market.status === MarketStatus.FUNDED ? '#FF3756' : 'grey.500'}
          >
            No {market?.prices[1]}%
          </Text>
        </HStack>
        <ProgressBar
          variant={market.status === MarketStatus.FUNDED ? 'market' : 'draft'}
          value={market.prices[0]}
        />
      </Box>
      <Divider my='16px' borderColor='grey.200' color='grey.200' />
      <HStack w='full' justifyContent='space-between'>
        <Text {...paragraphMedium} color='grey.500'>
          Value {NumberUtil.convertWithDenomination(market.openInterestFormatted, 0)}{' '}
          {market.collateralToken.symbol}
        </Text>
        <Text {...paragraphMedium} color='grey.500'>
          💧 Liquidity {NumberUtil.convertWithDenomination(market.liquidityFormatted, 0)}{' '}
          {market.collateralToken.symbol}
        </Text>
      </HStack>
    </Paper>
  )
}
