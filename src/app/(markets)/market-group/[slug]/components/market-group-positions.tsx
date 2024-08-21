import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import ChartIcon from '@/resources/icons/chart-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { PositionCard } from '@/app/(markets)/markets/[address]/components'
import { useHistory } from '@/services'
import { useMemo } from 'react'
import { MarketGroup } from '@/types'
import { Address } from 'viem'

interface MarketGroupPositionsProps {
  marketGroup: MarketGroup
}

export default function MarketGroupPositions({ marketGroup }: MarketGroupPositionsProps) {
  const { positions: allMarketsPositions } = useHistory()

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter((position) =>
        marketGroup.markets.some(
          (market) => position.market.id.toLowerCase() === market?.address.toLowerCase()
        )
      ),
    [allMarketsPositions, marketGroup.markets]
  )

  const getMarketPrices = (address: Address) => {
    return marketGroup.markets.find(
      (market) => market.address.toLowerCase() === address.toLowerCase()
    )?.prices
  }

  const getMarketTitle = (address: Address) => {
    return marketGroup.markets.find(
      (market) => market.address.toLowerCase() === address.toLowerCase()
    )?.title
  }

  return Number(positions?.length) > 0 ? (
    <>
      <Flex mt='24px' justifyContent='space-between' mb='8px'>
        <HStack color='grey.800' gap='4px'>
          <ChartIcon width='16px' height='16px' />
          <Text {...paragraphMedium}>Portfolio</Text>
        </HStack>
      </Flex>
      <VStack gap='8px' flexDir='column' w='full'>
        {positions?.map((position, index) => (
          <PositionCard
            position={position}
            key={index}
            symbol={marketGroup.collateralToken.symbol}
            marketPrices={getMarketPrices(position.market.id) || [50, 50]}
            title={getMarketTitle(position.market.id)}
          />
        ))}
      </VStack>
    </>
  ) : (
    <></>
  )
}
