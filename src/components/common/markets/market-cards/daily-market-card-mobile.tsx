import React from 'react'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { DailyCardTrigger } from './daily-market-card-trigger'
import { useTradingService } from '@/services'
import { Market } from '@/types'

export interface DailyMarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
  markets: Market[]
}

export default function DailyMarketCardMobile({
  market,
  markets,
  analyticParams,
}: DailyMarketCardProps) {
  const { onCloseMarketPage } = useTradingService()

  return (
    <MobileDrawer
      id={market.address}
      trigger={
        <DailyCardTrigger market={market} markets={markets} analyticParams={analyticParams} />
      }
      onClose={onCloseMarketPage}
      variant='black'
    >
      <MarketPage />
    </MobileDrawer>
  )
}
