import { FeedEntity, FeedNewPostData } from '@/types'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'

interface FeedNewPostProps {
  data: FeedEntity<FeedNewPostData>
}

export default function FeedNewPost({ data }: FeedNewPostProps) {
  return (
    <MarketFeedCardContainer
      creator={data.user}
      timestamp={new Date(data.timestamp).getTime() / 1000}
      title={`${data.data.content}`}
    ></MarketFeedCardContainer>
  )
}
