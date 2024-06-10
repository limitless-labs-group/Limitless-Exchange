'use client'

import { Flex, Spacer, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'

import { MainLayout } from '@/components'
import {
  MarketClaimingForm,
  MarketMetadata,
  MarketPositions,
  MarketTradingForm,
} from '@/app/markets/[address]/components'
import type { PageOpenedMetadata } from '@/services'
import { OpenEvent, useAmplitude, useTradingService } from '@/services'
import { MarketPriceChart } from '@/app/markets/[address]/components/MarketPriceChart'
import { useMarket } from '@/services/MarketsService'
import ApproveModal from '@/components/common/ApproveModal'

const MarketPage = ({ params }: { params: { address: string } }) => {
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()

  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: params.address,
    })
  }, [])

  /**
   * SET MARKET
   */
  const market = useMarket(params.address)

  const {
    setMarket,
    market: previousMarket,
    approveBuy,
    strategy,
    approveSell,
  } = useTradingService()

  useEffect(() => {
    if (market != previousMarket) {
      setMarket(market)
    }
  }, [market, previousMarket])

  const handleApproveMarket = async () => {
    return strategy === 'Buy' ? approveBuy() : approveSell()
  }

  return (
    <MainLayout maxContentWidth={'1200px'}>
      {!market ? (
        <Flex w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
          <Spinner />
        </Flex>
      ) : (
        <>
          <Flex gap={{ sm: 10, md: 12 }} flexDir={{ sm: 'column', lg: 'row' }}>
            <Flex flexBasis={'66%'} flexDir={{ sm: 'column' }} gap={{ sm: 4, md: 10 }}>
              <MarketMetadata />
              <MarketPriceChart market={market} />
              {!market?.expired && <MarketPositions />}
            </Flex>

            <Flex flexBasis={'33%'}>
              {market?.expired ? <MarketClaimingForm market={market} /> : <MarketTradingForm />}
            </Flex>
            <Spacer />
          </Flex>
          <ApproveModal onApprove={handleApproveMarket} />
        </>
      )}
    </MainLayout>
  )
}

export default MarketPage
