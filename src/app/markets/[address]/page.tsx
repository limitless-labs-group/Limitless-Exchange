'use client'

import { MainLayout } from '@/components'
import {
  MarketClaimingForm,
  MarketMetadata,
  MarketPositions,
  MarketTradingForm,
} from '@/app/markets/[address]/components'
import { Flex, Spacer, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useTradingService } from '@/services'
import { MarketPriceChart } from '@/app/markets/[address]/components/MarketPriceChart'
import { useMarket } from '@/services/MarketsService'
import ApproveModal from '@/components/common/ApproveModal'
import { useToken } from '@/hooks/use-token'
import { defaultChain } from '@/constants'
import { useConditionResolved } from '@/hooks'
import { getAddress } from 'viem'

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

  const { data: resolved } = useConditionResolved({
    marketAddr: !!market ? getAddress(market.address[defaultChain.id]) : undefined,
  })
  const { isLoading: isCollateralLoading } = useToken(market?.collateralToken[defaultChain.id])

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
      {!market || isCollateralLoading ? (
        <Flex w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
          <Spinner />
        </Flex>
      ) : (
        <>
          <Flex gap={{ sm: 10, md: 12 }} flexDir={{ sm: 'column', lg: 'row' }}>
            <Flex flexBasis={'66%'} flexDir={{ sm: 'column' }} gap={{ sm: 4, md: 10 }}>
              <MarketMetadata />
              <MarketPriceChart market={market} />
              {!resolved && <MarketPositions />}
            </Flex>

            <Flex flexBasis={'33%'}>
              {resolved ? (
                <MarketClaimingForm market={market} />
              ) : (
                <MarketTradingForm market={market} />
              )}
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
