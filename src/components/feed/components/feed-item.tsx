import { Box } from '@chakra-ui/react'
import FeedGroupClosed from '@/components/feed/components/feed-group-closed'
import FeedGroupCreated from '@/components/feed/components/feed-group-created'
import FeedNewPost from '@/components/feed/components/feed-new-post'
import MarketFeedTradeCard from '@/components/feed/components/market-feed-trade-card'
import MarketStatusUpdatedCard from '@/components/feed/components/market-status-updated-card'
import { FeedComment } from './comment-feed'
import {
  FeedEventType,
  MarketStatusFeedData,
  FeedEntity,
  FeedNewPostData,
  MarketNewTradeFeedData,
  FeedNewComment,
  FeedNewCommentLike,
  GroupFeedData,
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
      const item = data as FeedEntity<FeedNewCommentLike>
      return <FeedComment data={item} />
    })(),
    [FeedEventType.ResolvedGroup]: (() => {
      const item = data as FeedEntity<GroupFeedData>
      return <FeedGroupClosed data={item} />
    })(),
    [FeedEventType.FundedGroup]: (() => {
      const item = data as FeedEntity<GroupFeedData>
      return <FeedGroupCreated data={item} />
    })(),
    // [FeedEventType.MarketClosed]: (() => {
    //   const item = data as FeedItem<MarketStatusData>
    //   return <MarketStatusUpdatedCard data={item} />
    // })(),
  }
  return <Box w='full'>{detailsFeedContent[data.eventType]}</Box>
}
