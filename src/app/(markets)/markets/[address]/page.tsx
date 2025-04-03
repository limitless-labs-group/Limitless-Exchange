'use client'

import { notFound } from 'next/navigation'
import React, { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import GroupMarketPage from '@/app/(markets)/markets/[address]/components/group-market-page'
import SingleMarketPage from '@/app/(markets)/markets/[address]/components/single-market-page'
import { MainLayout } from '@/components'
import { OpenEvent, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { Market } from '@/types'

const MarketPage = ({ params }: { params: { address: Address } }) => {
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  const { data: market, isLoading: fetchMarketLoading } = useMarket(params.address)
  const { setMarket, resetQuotes, setGroupMarket } = useTradingService()

  useEffect(() => {
    if (market) {
      setMarket(market.marketType === 'single' ? market : (market.markets as Market[])[0])
      if (market.marketType === 'group') {
        setGroupMarket(market)
      }
    }
  }, [market])

  useEffect(() => {
    resetQuotes()
  }, [])

  useEffect(() => {
    if (market) {
      trackOpened(OpenEvent.MarketPageOpened, {
        marketAddress: market.slug,
        page: 'Market Page',
        marketMakerType: market.tradeType.toUpperCase(),
      })
    }
  }, [market])

  // Trigger the not-found page when market is not found and loading is complete
  useEffect(() => {
    if (!market && !fetchMarketLoading) {
      notFound()
    }
  }, [market, fetchMarketLoading])

  return (
    <MainLayout layoutPadding={isMobile ? '0' : '4'}>
      {market?.marketType === 'single' ? (
        <SingleMarketPage fetchMarketLoading={fetchMarketLoading} />
      ) : (
        <GroupMarketPage fetchMarketLoading={fetchMarketLoading} />
      )}
    </MainLayout>
  )
}

export default MarketPage
