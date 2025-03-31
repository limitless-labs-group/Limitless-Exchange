import React from 'react'
import MobileDrawer from '@/components/common/drawer'
import MarketCardTrigger from '@/components/common/markets/market-cards/market-card-trigger'
import MarketPage from '@/components/common/markets/market-page'
import { MarketCardProps } from './market-card'
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
      renderPrevNext={true}
    >
      <MarketPage />
    </MobileDrawer>
  )
}
