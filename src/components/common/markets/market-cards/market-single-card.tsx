import React from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { MarketCardLink } from './market-card-link'
import { SingleCardTrigger } from './market-single-card-trigger'
import { useTradingService } from '@/services'
import { Market } from '@/types'

export interface MarketSingleCardProps {
  market: Market
  markets?: Market[]
}

export const MarketSingleCard = ({ market, markets }: MarketSingleCardProps) => {
  const { onCloseMarketPage } = useTradingService()

  return isMobile ? (
    <MobileDrawer
      id={market.address}
      trigger={<SingleCardTrigger market={market} markets={markets} />}
      variant='black'
      onClose={onCloseMarketPage}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    <MarketCardLink marketAddress={market.address}>
      {<SingleCardTrigger market={market} markets={markets} />}
    </MarketCardLink>
  )
}
