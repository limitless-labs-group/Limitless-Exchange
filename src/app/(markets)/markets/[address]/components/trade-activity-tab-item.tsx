import { useMemo } from 'react'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { FeedEntity, MarketNewTradeFeedData } from '@/types'
import { NumberUtil } from '@/utils'

interface TradeActivityTabItemProps {
  tradeItem: FeedEntity<MarketNewTradeFeedData>
}

export default function TradeActivityTabItem({ tradeItem }: TradeActivityTabItemProps) {
  const title = useMemo(() => {
    const title = tradeItem.data.strategy === 'Buy' ? 'Bought' : 'Sold'
    const outcome = tradeItem.data.outcome
    return `${title} ${NumberUtil.toFixed(
      tradeItem.data.contracts,
      6
    )} contracts ${outcome} for ${NumberUtil.convertWithDenomination(
      Math.abs(+tradeItem.data.tradeAmount),
      6,
      tradeItem.data.symbol
    )} ${tradeItem.data.symbol} in total.`
  }, [tradeItem])

  return (
    <MarketFeedCardContainer
      user={tradeItem.user}
      eventType={tradeItem.eventType}
      timestamp={new Date(tradeItem.timestamp).getTime() / 1000}
      title={title}
      isActivityTab={true}
    />
  )
}
