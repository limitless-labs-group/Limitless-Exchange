import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { PositionCard } from '@/app/(markets)/markets/[address]/components'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import { HistoryPositionWithType } from '@/services'
import { usePosition } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

interface MarketPositionsProps {
  market?: Market
  isSideMarketPage?: boolean
  showPortfolioIcon?: boolean
}

export const MarketPositions = ({
  market,
  isSideMarketPage,
  showPortfolioIcon = true,
}: MarketPositionsProps) => {
  const { data: allMarketsPositions } = usePosition()

  const positions = useMemo(
    () =>
      allMarketsPositions?.positions.filter(
        (position) => position.type === 'amm' && position.market.slug === market?.slug
      ) as HistoryPositionWithType[],
    [allMarketsPositions, market]
  )

  return Number(positions?.length) > 0 ? (
    <Box mb='24px'>
      {showPortfolioIcon && (
        <Flex mt='24px' justifyContent='space-between' mb='8px'>
          <HStack color='grey.800' gap='4px'>
            <PortfolioIcon width='16px' height='16px' />
            <Text {...paragraphMedium}>Portfolio</Text>
          </HStack>
        </Flex>
      )}

      <VStack gap='8px' flexDir='column' w='full' mt={showPortfolioIcon ? 0 : '24px'}>
        {positions?.map((position, index) => (
          <PositionCard
            position={position}
            key={index}
            symbol={market?.collateralToken.symbol || ''}
            marketPrices={market?.prices || [50, 50]}
            isSideMarketPage={isSideMarketPage}
          />
        ))}
      </VStack>
    </Box>
  ) : (
    <></>
  )
}
