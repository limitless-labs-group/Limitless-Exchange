import { FeedEvent, FeedEventType, TradeContractsData } from '@/components/feed/types'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { useMemo } from 'react'
import { HStack, Text } from '@chakra-ui/react'
import { captionRegular } from '@/styles/fonts/fonts.styles'
import PieChartIcon from '@/resources/icons/pie-chart-icon.svg'

interface MarketFeedTradeCardProps {
  data: FeedEvent<TradeContractsData>
}

export default function MarketFeedTradeCard({ data }: MarketFeedTradeCardProps) {
  const eventTitle = useMemo(() => {
    const title = data.eventType === FeedEventType.BoughtContracts ? 'Bought' : 'Sold'
    const outcome = data.data.outcomeIndex ? 'NO' : 'YES'
    return `${title} contracts ${data.data.price}% ${outcome} for ${data.data.collateralToken.collateralAmount} ${data.data.collateralToken.symbol} in total.`
  }, [data])
  return (
    <MarketFeedCardContainer creator={data.creator} timestamp={data.timestamp} title={eventTitle}>
      <HStack gap='4px' color='grey.500'>
        <PieChartIcon width={14} height={14} />
        <Text
          {...captionRegular}
          color='grey.500'
          textOverflow='ellipsis'
          whiteSpace='nowrap'
          overflow='hidden'
          maxW='calc(100% - 22px)'
        >
          {data.market.name}
        </Text>
      </HStack>
    </MarketFeedCardContainer>
  )
}
