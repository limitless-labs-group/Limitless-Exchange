'use client'

import { MainLayout } from '@/components'
import { MarketMetadata, MarketPositions, TradeForm } from '@/app/markets/[address]/components'
import { Flex, HStack, Spacer, Stack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useTradingService } from '@/services'
import { defaultChain, markets } from '@/constants'
import { Market } from '@/types'

const MarketPage = ({ params }: { params: { address: string } }) => {
  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: params.address,
    })
  }, [])

  const market: Market | null = useMemo(
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

  return (
    <MainLayout maxContentWidth={'1200px'}>
      <Stack spacing={{ sm: '40px', md: 8 }} flexDir={{ sm: 'column', lg: 'row' }}>
        <Stack flexBasis={'66%'} spacing={{ sm: 4, md: 10 }}>
          <MarketMetadata />
          <MarketPositions />
        </Stack>
        <TradeForm flexBasis={'33%'} />
        <Spacer />
      </Stack>
    </MainLayout>
  )
}

export default MarketPage
