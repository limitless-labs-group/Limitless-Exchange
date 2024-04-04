'use client'

import { MainLayout } from '@/components'
import { MarketMetadata, TradeForm } from '@/app/markets/[address]/components'
import { Flex, Spacer } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useTradingService } from '@/services'
import { defaultChain, markets } from '@/constants'
import { Market } from '@/types'
import { getAddress } from 'viem'

const MarketPage = ({ params }: { params: { address: string } }) => {
  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: getAddress(params.address),
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
    <MainLayout>
      <Flex gap={{ sm: '40px', md: 8 }} flexDir={{ sm: 'column', lg: 'row' }}>
        <MarketMetadata flexBasis={'66%'} />
        <TradeForm flexBasis={'33%'} />
        <Spacer />
      </Flex>
    </MainLayout>
  )
}

export default MarketPage
