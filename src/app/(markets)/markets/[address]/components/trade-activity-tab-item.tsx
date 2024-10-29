import { useMemo } from 'react'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { FeedEntity, MarketNewTradeFeedData } from '@/types'

interface TradeActivityTabItemProps {
  tradeItem: FeedEntity<MarketNewTradeFeedData>
}

export default function TradeActivityTabItem({ tradeItem }: TradeActivityTabItemProps) {
  const title = useMemo(() => {
    const title = tradeItem.data.strategy === 'Buy' ? 'Bought' : 'Sold'
    const outcome = tradeItem.data.outcome
    return `${title} ${tradeItem.data.contracts} contracts ${outcome} for ${Math.abs(
      +tradeItem.data.tradeAmount
    )} ${tradeItem.data.symbol} in total.`
  }, [tradeItem])

  return (
    <MarketFeedCardContainer
      user={tradeItem.user}
      timestamp={new Date(tradeItem.timestamp).getTime() / 1000}
      title={title}
      isActivityTab={true}
    />
  )
}
