import { MarketSingleCardResponse } from '@/types'
import BigBanner from '@/components/common/markets/big-banner'

interface TopMarketsProps {
  markets: MarketSingleCardResponse[]
}

export default function TopMarkets({ markets }: TopMarketsProps) {
  const cards = markets.map((market) => <BigBanner market={market} key={market.address} />)
  return cards[0]
}
