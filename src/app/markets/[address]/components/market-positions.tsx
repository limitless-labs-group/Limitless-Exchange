import { defaultChain } from '@/constants'
import { useHistory } from '@/services'
import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Market } from '@/types'
import ChartIcon from '@/resources/icons/chart-icon.svg'
import { PositionCard } from '@/app/markets/[address]/components'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface MarketPositionsProps {
  market: Market | null
}

export const MarketPositions = ({ market }: MarketPositionsProps) => {
  const { positions: allMarketsPositions } = useHistory()

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  return Number(positions?.length) > 0 ? (
    <>
      <Flex mt='24px' justifyContent='space-between' mb='8px'>
        <HStack color='black' gap='4px'>
          <ChartIcon width='16px' height='16px' />
          <Text {...paragraphMedium}>Portfolio</Text>
        </HStack>
      </Flex>
      <VStack gap='8px' flexDir='column' w='full'>
        {positions?.map((position, index) => (
          <PositionCard position={position} key={index} market={market} />
        ))}
      </VStack>
    </>
  ) : (
    <></>
  )
}
