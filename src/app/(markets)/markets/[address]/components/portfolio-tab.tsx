import { VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import Skeleton from '@/components/common/skeleton'
import MarketGroupPositions from '@/app/(markets)/market-group/[slug]/components/market-group-positions'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components/market-positions'
import { useTradingService } from '@/services'

export default function PortfolioTab() {
  const { marketGroup, market } = useTradingService()
  return !market ? (
    <VStack w='full' gap='8px'>
      {[...Array(6)].map((index) => (
        <Skeleton height={isMobile ? 148 : 76} key={index} />
      ))}
    </VStack>
  ) : (
    <>
      {marketGroup && <MarketGroupPositions marketGroup={marketGroup} />}
      <MarketPositions market={market} />
    </>
  )
}
