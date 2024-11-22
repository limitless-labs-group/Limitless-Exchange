import { Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import MarketGroupPositions from '@/app/(markets)/market-group/[slug]/components/market-group-positions'
import { MarketPositions } from '@/app/(markets)/markets/[address]/components/market-positions'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import { useHistory, useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'

export default function PortfolioTab() {
  const { marketGroup, market } = useTradingService()
  const { positions: allMarketsPositions } = useHistory()

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  if (!positions?.length) {
    return (
      <Text {...headline} mt='24px'>
        No recent activity
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
      {marketGroup && <MarketGroupPositions marketGroup={marketGroup} />}
      <MarketPositions market={market} showPortfolioIcon={false} />
    </>
  )
}
