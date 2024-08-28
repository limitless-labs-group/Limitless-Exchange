import { FeedEvent, MarketStatusData } from '@/app/feed/types'
import MarketFeedCardContainer from '@/app/feed/components/market-feed-card-container'

interface MarketStatusUpdatedCardProps {
  data: FeedEvent<MarketStatusData>
}

export default function MarketStatusUpdatedCard({ data }: MarketStatusUpdatedCardProps) {
  return (
    <MarketFeedCardContainer
      creator={data.creator}
      timestamp={data.timestamp}
    ></MarketFeedCardContainer>
  )
}
