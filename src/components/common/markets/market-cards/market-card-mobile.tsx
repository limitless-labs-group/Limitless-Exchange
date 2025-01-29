import React from 'react'
import { Address } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { MarketCardTrigger } from './market-card-trigger'
import { useTradingService } from '@/services'
import { Market } from '@/types'

export interface MarketCardProps {
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
  markets: Market[]
}

export default function MarketCardMobile({ market, markets, analyticParams }: MarketCardProps) {
  const { onCloseMarketPage } = useTradingService()

  return (
    <MobileDrawer
      id={market.address as Address}
      trigger={
        <MarketCardTrigger market={market} markets={markets} analyticParams={analyticParams} />
      }
      onClose={onCloseMarketPage}
      variant='black'
    >
      <MarketPage />
    </MobileDrawer>
  )
}
