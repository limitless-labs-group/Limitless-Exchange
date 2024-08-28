import { FeedEvent, FeedEventType, MarketStatusData, TradeContractsData } from '@/app/feed/types'
import MarketFeedTradeCard from '@/app/feed/components/market-feed-trade-card'
import MarketStatusUpdatedCard from '@/app/feed/components/market-status-updated-card'
import { Box } from '@chakra-ui/react'

interface FeedItemProps {
  data: FeedEvent<unknown>
}

export default function FeedItem({ data }: FeedItemProps) {
  const detailsFeedContent: Record<FeedEventType, JSX.Element> = {
    [FeedEventType.BoughtContracts]: (() => {
      const item = data as FeedEvent<TradeContractsData>
      return <MarketFeedTradeCard data={item} />
    })(),
    [FeedEventType.SoldContracts]: (() => {
      const item = data as FeedEvent<TradeContractsData>
      return <MarketFeedTradeCard data={item} />
    })(),
    [FeedEventType.MarketCreated]: (() => {
      const item = data as FeedEvent<MarketStatusData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.MarketClosed]: (() => {
      const item = data as FeedEvent<MarketStatusData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
  }
  return <Box>{detailsFeedContent[data.eventType]}</Box>
}
