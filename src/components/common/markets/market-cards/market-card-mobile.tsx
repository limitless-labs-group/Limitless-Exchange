import React from 'react'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { MarketCardLayout } from './market-card'
import { MarketCardTrigger } from './market-card-trigger'
import { useTradingService } from '@/services'
import { Market } from '@/types'

export interface MarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
  markets: Market[]
  variant?: MarketCardLayout
}

export default function MarketCardMobile({
  variant,
  market,
  markets,
  analyticParams,
}: MarketCardProps) {
  const { onCloseMarketPage } = useTradingService()

  return (
    <MobileDrawer
      id={market.slug}
      trigger={
        <MarketCardTrigger
          variant={variant}
          market={market}
          markets={markets}
          analyticParams={analyticParams}
        />
      }
      onClose={onCloseMarketPage}
      variant='black'
      renderPrevNext={true}
    >
      <MarketPage />
    </MobileDrawer>
  )
}
