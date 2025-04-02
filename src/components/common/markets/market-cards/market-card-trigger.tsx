import React from 'react'
import { MarketCardProps, MarketGroupCard } from '@/components/common/markets'
import MarketCardTriggerSingle from '@/components/common/markets/market-cards/market-card-trigger-single'

export default function MarketCardTrigger({ market, ...props }: MarketCardProps) {
  return market.marketType === 'single' ? (
    <MarketCardTriggerSingle market={market} {...props} />
  ) : (
    <MarketGroupCard {...props} variant='groupRow' market={market} />
  )
}
