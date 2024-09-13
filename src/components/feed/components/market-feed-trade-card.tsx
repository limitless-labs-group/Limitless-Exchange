import { FeedEntity, MarketNewTradeFeedData } from '@/types'
import { useMemo } from 'react'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { HStack, Link } from '@chakra-ui/react'
import { captionRegular } from '@/styles/fonts/fonts.styles'
import PieChartIcon from '@/resources/icons/pie-chart-icon.svg'
import NextLink from 'next/link'

interface MarketFeedTradeCardProps {
  data: FeedEntity<MarketNewTradeFeedData>
}

export default function MarketFeedTradeCard({ data }: MarketFeedTradeCardProps) {
  const eventTitle = useMemo(() => {
    const title = data.data.strategy === 'Buy' ? 'Bought' : 'Sold'
    const outcome = data.data.outcome
    return `${title} ${data.data.contracts} contracts ${outcome} for ${Math.abs(
      +data.data.tradeAmount
    )} ${data.data.symbol} in total.`
  }, [data])
  return (
    <MarketFeedCardContainer
      creator={data.user}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={eventTitle}
    >
      <HStack gap='4px' color='grey.500'>
        <PieChartIcon width={14} height={14} />
        <NextLink href={`https://${window.location.origin}/markets/${data.data.address}`}>
          <Link
            variant='textLink'
            {...captionRegular}
            color='grey.500'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
            overflow='hidden'
            maxW='calc(100% - 22px)'
          >
            {data.data.title}
          </Link>
        </NextLink>
      </HStack>
    </MarketFeedCardContainer>
  )
}
