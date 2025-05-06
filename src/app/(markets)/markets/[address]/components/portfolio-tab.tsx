import { Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import Skeleton from '@/components/common/skeleton'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components/market-positions'
import { usePosition, useTradingService } from '@/services'
import { headline } from '@/styles/fonts/fonts.styles'

export default function PortfolioTab() {
  const { market } = useTradingService()
  const { data: allMarketsPositions } = usePosition()

  const positions = useMemo(
    () =>
      allMarketsPositions?.positions
        ?.filter((position) => position.type === 'amm')
        .filter((position) => position.market.slug === market?.slug),
    [allMarketsPositions, market]
  )

  if (!positions?.length) {
    return (
      <Text {...headline} mt='24px'>
        No open positions
      </Text>
    )
  }

  return !market ? (
    <VStack w='full' gap='8px'>
      {[...Array(6)].map((index) => (
        <Skeleton height={isMobile ? 148 : 76} key={index} />
      ))}
    </VStack>
  ) : (
    <>
      <MarketPositions market={market} showPortfolioIcon={false} />
    </>
  )
}
