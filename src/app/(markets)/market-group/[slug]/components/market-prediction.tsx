import { Box, HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Paper from '@/components/common/paper'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface MarketPredictionProps {
  market: Market
  setSelectedMarket: (market: Market) => void
}

export default function MarketPrediction({ market, setSelectedMarket }: MarketPredictionProps) {
  const defaultColors = {
    main: 'var(--chakra-colors-grey-800)',
    secondary: 'var(--chakra-colors-grey-500)',
    chartBg: 'var(--chakra-colors-grey-300)',
  }

  const hoverColors = {
    main: 'var(--chakra-colors-white)',
    secondary: 'var(--chakra-colors-transparent-700)',
    chartBg: 'var(--chakra-colors-transparent-300)',
  }

  const [colors, setColors] = useState(defaultColors)

  return (
    <Paper
      w='full'
      cursor='pointer'
      onMouseEnter={() => setColors(hoverColors)}
      onMouseLeave={() => setColors(defaultColors)}
      onClick={() => setSelectedMarket(market)}
      {...(!isMobile
        ? {
            _hover: {
              bg: 'blue.500',
            },
          }
        : {})}
    >
      <HStack justifyContent='space-between'>
        <Text {...paragraphMedium} color={colors.main}>
          {market.title}
        </Text>
        <HStack gap={1}>
          <Text {...paragraphMedium} color={colors.main}>
            {market.prices[0] >= 1 ? market.prices[0] : '< 1'}%
          </Text>
          <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
            <Box
              h='100%'
              w='100%'
              borderRadius='100%'
              bg={`conic-gradient(${colors.main} 0% ${market.prices[0]}%, ${colors.chartBg} ${
                market.prices[0] < 1 ? 1 : market.prices[0]
              }% 100%)`}
            />
          </Box>
        </HStack>
      </HStack>
      <HStack
        gap={isMobile ? '8px' : '16px'}
        mt={isMobile ? '16px' : '8px'}
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <HStack
          w={isMobile ? '100%' : 'unset'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
        >
          <HStack color={colors.secondary} gap='4px'>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.secondary}>
              Liquidity
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={colors.main}>
            {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
            {market.collateralToken.symbol}
          </Text>
        </HStack>
        <HStack
          w={isMobile ? '100%' : 'unset'}
          justifyContent={isMobile ? 'space-between' : 'unset'}
        >
          <HStack color={colors.secondary} gap='4px'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.secondary}>
              Volume
            </Text>
          </HStack>
          <Text {...paragraphRegular} color={colors.main}>
            {NumberUtil.formatThousands(market.volumeFormatted, 6)} {market.collateralToken.symbol}
          </Text>
        </HStack>
      </HStack>
    </Paper>
  )
}
