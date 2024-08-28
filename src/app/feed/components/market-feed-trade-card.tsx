import { FeedEvent, TradeContractsData } from '@/app/feed/types'
import MarketFeedCardContainer from '@/app/feed/components/market-feed-card-container'

interface MarketFeedTradeCardProps {
  data: FeedEvent<TradeContractsData>
}

export default function MarketFeedTradeCard({ data }: MarketFeedTradeCardProps) {
  return (
    <MarketFeedCardContainer
      creator={data.creator}
      timestamp={data.timestamp}
    ></MarketFeedCardContainer>
  )
}
