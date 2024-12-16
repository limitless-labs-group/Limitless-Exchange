import { Box } from '@chakra-ui/react'
import FeedNewPost from '@/components/feed/components/feed-new-post'
import GroupStatusUpdatedCard from '@/components/feed/components/group-status-updated-card'
import MarketFeedTradeCard from '@/components/feed/components/market-feed-trade-card'
import MarketStatusUpdatedCard from '@/components/feed/components/market-status-updated-card'
import { FeedComment } from './comment-feed'
import {
  FeedEventType,
  MarketStatusFeedData,
  FeedEntity,
  FeedNewPostData,
  MarketGroupStatusFeedData,
  MarketNewTradeFeedData,
  FeedNewComment,
} from '@/types'

interface FeedItemProps {
  data: FeedEntity<unknown>
}

export default function FeedItem({ data }: FeedItemProps) {
  const detailsFeedContent: Record<FeedEventType, JSX.Element> = {
    // [FeedEventType.BoughtContracts]: (() => {
    //   const item = data as FeedItem<TradeContractsData>
    //   return <MarketFeedTradeCard data={item} />
    // })(),
    [FeedEventType.NewTrade]: (() => {
      const item = data as FeedEntity<MarketNewTradeFeedData>
      return <MarketFeedTradeCard data={item} />
    })(),
    [FeedEventType.ResolvedGroup]: (() => {
      const item = data as FeedEntity<MarketGroupStatusFeedData>
      return <GroupStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.LockedGroup]: (() => {
      const item = data as FeedEntity<MarketGroupStatusFeedData>
      return <GroupStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.FundedGroup]: (() => {
      const item = data as FeedEntity<MarketGroupStatusFeedData>
      return <GroupStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.NewPost]: (() => {
      const item = data as FeedEntity<FeedNewPostData>
      return <FeedNewPost data={item} />
    })(),
    [FeedEventType.Funded]: (() => {
      const item = data as FeedEntity<MarketStatusFeedData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.Resolved]: (() => {
      const item = data as FeedEntity<MarketStatusFeedData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.Locked]: (() => {
      const item = data as FeedEntity<MarketStatusFeedData>
      return <MarketStatusUpdatedCard data={item} />
    })(),
    [FeedEventType.Comment]: (() => {
      const item = data as FeedEntity<FeedNewComment>
      return <FeedComment data={item} />
    })(),
    [FeedEventType.CommentLike]: (() => {
      const item = data as FeedEntity<FeedNewComment>
      return <FeedComment data={item} />
    })(),
    // [FeedEventType.MarketClosed]: (() => {
    //   const item = data as FeedItem<MarketStatusData>
    //   return <MarketStatusUpdatedCard data={item} />
    // })(),
  }
  return <Box w='full'>{detailsFeedContent[data.eventType]}</Box>
}
