import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { useTradingService } from '@/services'
import { FeedEventType } from '@/types'
import { ClobTradeEvent } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface ActivityClobItemProps {
  data: ClobTradeEvent
}

export default function ActivityClobItem({ data }: ActivityClobItemProps) {
  const { market } = useTradingService()
  const title = useMemo(() => {
    const title = data.side === 0 ? 'Bought' : 'Sold'
    const outcome = market?.tokens?.yes === data.tokenId ? 'Yes' : 'No'
    const totalAmount = formatUnits(BigInt(data.takerAmount), market?.collateralToken.decimals || 6)
    return `${title} ${NumberUtil.toFixed(
      formatUnits(BigInt(data.matchedSize), market?.collateralToken.decimals || 6),
      6
    )} contracts ${outcome} for ${NumberUtil.toFixed(
      Math.abs(new BigNumber(totalAmount).toNumber()),
      market?.collateralToken.symbol === 'USDC' ? 2 : 6
    )} ${market?.collateralToken.symbol} in total.`
  }, [market, data])

  const user = {
    name: data.profile.displayName,
    imageURI: data.profile.pfpUrl || '',
    link: data.profile.socialUrl || '',
    account: data.profile.smartWallet || data.profile.account,
  }

  return (
    <MarketFeedCardContainer
      user={user}
      eventType={FeedEventType.NewTrade}
      timestamp={new Date(data.createdAt).getTime() / 1000}
      title={title}
      isActivityTab={true}
    />
  )
}
