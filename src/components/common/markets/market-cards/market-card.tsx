import { MarketGroupCard } from '@/components/common/markets'
import {
  MarketCardLayout,
  MarketSingleCard,
} from '@/components/common/markets/market-cards/market-single-card'
import { Market } from '@/types'

export interface MarketCardProps {
  variant?: MarketCardLayout
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
  markets?: Market[]
}

export default function MarketCard({ market, variant, analyticParams, markets }: MarketCardProps) {
  return market.marketType === 'single' ? (
    <MarketSingleCard market={market} variant={variant} analyticParams={analyticParams} />
  ) : (
    <MarketGroupCard
      market={market}
      variant={variant === 'row' ? 'groupRow' : variant}
      analyticParams={analyticParams}
      markets={markets || []}
    />
  )
}
