'use client'

import { MainLayout } from '@/components'
import {
  MarketClaimingForm,
  MarketMetadata,
  MarketPositions,
  MarketTradingForm,
} from '@/app/markets/[address]/components'
import { Spacer, Spinner, Stack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useTradingService } from '@/services'
import { defaultChain, markets } from '@/constants'
import { useRouter } from 'next/navigation'

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
  const market = useMemo(
    () =>
      markets.find(
        (market) => market.address[defaultChain.id]?.toLowerCase() === params.address.toLowerCase()
      ) ?? null,
    [params.address]
  )

  const { setMarket, market: previousMarket } = useTradingService()

  useEffect(() => {
    if (market != previousMarket) {
      setMarket(market)
    }
  }, [market, previousMarket])

  /**
   * REDIRECT ON 404
   */
  const router = useRouter()

  useEffect(() => {
    if (!market) {
      router.replace('/')
    }
  }, [market])

  return (
    <MainLayout maxContentWidth={'1200px'}>
      {!market ? (
        <Stack w={'full'} h={'80vh'} alignItems={'center'} justifyContent={'center'}>
          <Spinner />
        </Stack>
      ) : (
        <Stack spacing={{ sm: 10, md: 12 }} flexDir={{ sm: 'column', lg: 'row' }}>
          <Stack flexBasis={'66%'} spacing={{ sm: 4, md: 10 }}>
            <MarketMetadata />
            {!market?.expired && <MarketPositions />}
          </Stack>

          <Stack flexBasis={'33%'}>
            {market?.expired ? <MarketClaimingForm /> : <MarketTradingForm />}
          </Stack>
          <Spacer />
        </Stack>
      )}
    </MainLayout>
  )
}

export default MarketPage
