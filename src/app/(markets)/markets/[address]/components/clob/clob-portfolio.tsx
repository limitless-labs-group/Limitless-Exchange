import { Box, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import PortfolioPositionCardClob from '@/app/portfolio/components/PortfolioPositionCardClob'
import { ClobPositionWithType, usePosition, useTradingService } from '@/services'
import { h3Regular, paragraphRegular } from '@/styles/fonts/fonts.styles'

const unhoveredColors = {
  main: 'grey.800',
  secondary: 'grey.500',
  contracts: '',
}

export default function ClobPortfolio() {
  const { data: allPositions } = usePosition()
  const { market } = useTradingService()

  const currentPosition = allPositions?.positions
    ?.filter((position) => position.type === 'clob')
    .filter((position) => !!+position.tokensBalance.yes || !!+position.tokensBalance.no)
    .find((position) => position.market.slug === market?.slug)

  return (
    <Box>
      <HStack gap='16px'>
        <Text {...h3Regular}>Portfolio</Text>
      </HStack>
      <Box mt='12px'>
        {currentPosition ? (
          <PortfolioPositionCardClob positionData={currentPosition as ClobPositionWithType} />
        ) : (
          <Text {...paragraphRegular}>No positions.</Text>
        )}
      </Box>
    </Box>
  )
}
