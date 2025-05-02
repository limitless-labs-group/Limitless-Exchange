'use client'

import {
  MarketClaimingForm,
  MarketMetadata,
  MarketPositions,
  MarketTradingForm,
} from '@/app/markets/[address]/components'
import { MarketPriceChart } from '@/app/markets/[address]/components/MarketPriceChart'
import { MainLayout } from '@/components'
import ApproveModal from '@/components/common/ApproveModal'
import { defaultChain } from '@/constants'
import { useToken } from '@/hooks/use-token'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { mockMarkets } from '@/services/mock-markets'
import { Market } from '@/types'
import { Flex, Spacer, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'

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

  console.log(params.address)

  /**
   * SET MARKET
   */
  // const market = useMarket(params.address)
  const market = mockMarkets.data.find(
    (mockMarket) => mockMarket.address[defaultChain.id] === params.address
  )

  // const { isLoading: isCollateralLoading } = useToken(market?.collateralToken[defaultChain.id])

  const {
    setMarket,
    market: previousMarket,
    // approveBuy,
    strategy,
    // approveSell,
  } = useTradingService()

  useEffect(() => {
    if (market != previousMarket) {
      setMarket(market as Market)
    }
  }, [market, previousMarket])

  // const handleApproveMarket = async () => {
  //   return strategy === 'Buy' ? approveBuy() : approveSell()
  // }

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
              {market?.expired ? (
                <MarketClaimingForm market={market} />
              ) : (
                <MarketTradingForm market={market} />
              )}
            </Flex>
            <Spacer />
          </Flex>
          {/*<ApproveModal onApprove={handleApproveMarket} />*/}
        </>
      )}
    </MainLayout>
  )
}

export default MarketPage
