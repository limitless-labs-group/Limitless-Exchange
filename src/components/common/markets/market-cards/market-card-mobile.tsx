import React from 'react'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { MarketCardProps } from './market-card'
import { MarketCardTrigger } from './market-card-trigger'
import { useTradingService } from '@/services'

export default function MarketCardMobile({
  variant,
  market,
  analyticParams,
  markets,
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
    >
      <MarketPage />
    </MobileDrawer>
  )
}
