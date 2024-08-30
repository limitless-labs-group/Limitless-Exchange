import MarketStatusUpdatedCard from '@/components/feed/components/market-status-updated-card'
import { Box } from '@chakra-ui/react'
import { FeedEventType, MarketStatusFeedData, FeedEntity } from '@/types'

interface FeedItemProps {
  data: FeedEntity<unknown>
}

export default function FeedItem({ data }: FeedItemProps) {
  const detailsFeedContent: Record<FeedEventType, JSX.Element> = {
    // [FeedEventType.BoughtContracts]: (() => {
    //   const item = data as FeedItem<TradeContractsData>
    //   return <MarketFeedTradeCard data={item} />
    // })(),
    // [FeedEventType.SoldContracts]: (() => {
    //   const item = data as FeedItem<TradeContractsData>
    //   return <MarketFeedTradeCard data={item} />
    // })(),
    [FeedEventType.Funded]: (() => {
      const item = data as FeedEntity<MarketStatusFeedData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.Resolved]: (() => {
      const item = data as FeedEntity<MarketStatusFeedData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
    // [FeedEventType.MarketClosed]: (() => {
    //   const item = data as FeedItem<MarketStatusData>
    //   return <MarketStatusUpdatedCard data={item} />
    // })(),
  }
  return <Box w='full'>{detailsFeedContent[data.eventType]}</Box>
}
