import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { ClosedGroupFeedData, FeedEntity } from '@/types'

interface FeedGroupClosedProps {
  data: FeedEntity<ClosedGroupFeedData>
}

export default function FeedGroupClosed({ data }: FeedGroupClosedProps) {
  const sortedMarkets = data.data.markets.sort((a, b) => b.winningIndex - a.winningIndex)

  return (
    <MarketFeedCardContainer
      user={data.user}
      eventType={data.eventType}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={`Closed market`}
    ></MarketFeedCardContainer>
  )
}
