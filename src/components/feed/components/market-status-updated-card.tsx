import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import MarketCardMobile from '@/components/common/markets/market-cards/market-card-mobile'
import MarketPage from '@/components/common/markets/market-page'
import Skeleton from '@/components/common/skeleton'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { useMarket } from '@/services/MarketsService'
import { FeedEventType, FeedEntity, MarketStatusFeedData, Market } from '@/types'

interface MarketStatusUpdatedCardProps {
  data: FeedEntity<MarketStatusFeedData>
}

export default function MarketStatusUpdatedCard({ data }: MarketStatusUpdatedCardProps) {
  const getText = () => {
    switch (data.eventType) {
      case FeedEventType.Locked:
        return 'Locked'
      case FeedEventType.Resolved:
        return 'Closed'
      default:
        return 'Created'
    }
  }

  const { data: market, isLoading: marketLoading } = useMarket(data.data.address ?? data.data.slug)

  const content = useMemo(() => {
    if (marketLoading || !market) {
      return <Skeleton height={isMobile ? 317 : 230} />
    }
    return isMobile ? (
      <MarketCardMobile
        market={market as Market}
        analyticParams={{ bannerPosition: 0, bannerPaginationPage: 1 }}
        markets={[]}
      />
    ) : (
      <MarketCard
        market={market as Market}
        analyticParams={{ bannerPosition: 0, bannerPaginationPage: 1 }}
        markets={[]}
      />
    )
  }, [marketLoading, market])

  return (
    <MarketFeedCardContainer
      user={data.user}
      eventType={data.eventType}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={`${getText()} market`}
    >
      {isMobile ? (
        <MobileDrawer trigger={content} variant='black'>
          <MarketPage />
        </MobileDrawer>
      ) : (
        content
      )}
    </MarketFeedCardContainer>
  )
}
