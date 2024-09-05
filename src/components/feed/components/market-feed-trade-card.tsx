import { FeedEntity, MarketNewTradeFeedData } from '@/types'
import { useMemo } from 'react'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { HStack, Text } from '@chakra-ui/react'
import { captionRegular } from '@/styles/fonts/fonts.styles'

interface MarketFeedTradeCardProps {
  data: FeedEntity<MarketNewTradeFeedData>
}

export default function MarketFeedTradeCard({ data }: MarketFeedTradeCardProps) {
  const eventTitle = useMemo(() => {
    const title = data.data.strategy === 'Buy' ? 'Bought' : 'Sold'
    const outcome = data.data.outcome ? 'NO' : 'YES'
    return `${title} contracts ${11.12}% ${outcome} for ${data.data.contracts} ${
      data.data.collateralToken.symbol
    } in total.`
  }, [data])
  return (
    <MarketFeedCardContainer
      creator={data.user}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={eventTitle}
    >
      <HStack gap='4px' color='grey.500'>
        {/*<PieChartIcon width={14} height={14} />*/}
        <Text
          {...captionRegular}
          color='grey.500'
          textOverflow='ellipsis'
          whiteSpace='nowrap'
          overflow='hidden'
          maxW='calc(100% - 22px)'
        >
          {data.data.title}
        </Text>
      </HStack>
    </MarketFeedCardContainer>
  )
}
