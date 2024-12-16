import React from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { BigBannerTrigger } from './big-banner-trigger'
import { MarketCardLink } from './market-cards/market-card-link'
import { useTradingService } from '@/services'
import { Market } from '@/types'

export interface BigBannerProps {
  market: Market
  markets: Market[]
}

export default function BigBanner({ market, markets }: BigBannerProps) {
  const { onCloseMarketPage } = useTradingService()

  return isMobile ? (
    <MobileDrawer
      id={market.address}
      trigger={<BigBannerTrigger market={market} markets={markets} />}
      variant='black'
      onClose={onCloseMarketPage}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    <MarketCardLink marketAddress={market.address}>
      {<BigBannerTrigger market={market} markets={markets} />}
    </MarketCardLink>
  )
}
