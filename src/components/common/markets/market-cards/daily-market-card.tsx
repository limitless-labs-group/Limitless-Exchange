import Paper from '@/components/common/paper'
import { isMobile } from 'react-device-detect'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import React, { useState } from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketSingleCardResponse } from '@/types'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import NextLink from 'next/link'

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

interface DailyMarketCardProps {
  market: MarketSingleCardResponse
}

export default function DailyMarketCard({ market }: DailyMarketCardProps) {
  const [colors, setColors] = useState(defaultColors)
  return (
    <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
      <Paper
        flex={1}
        h={isMobile ? '240px' : '160px'}
        w={isMobile ? '100%' : '100%'}
        _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
        onMouseEnter={() => !isMobile && setColors(hoverColors)}
        onMouseLeave={() => !isMobile && setColors(defaultColors)}
      >
        <Flex h='full' flexDirection='column' justifyContent='space-between'>
          <HStack justifyContent='space-between'>
            <HStack gap='4px' color={colors.main}>
              <LiquidityIcon width={16} height={16} />
              <Text {...paragraphMedium} color={colors.main}>
                {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
                {market.collateralToken.symbol}
              </Text>
            </HStack>
            <HStack gap='4px' color={colors.main}>
              <VolumeIcon width={16} height={16} />
              <Text {...paragraphMedium} color={colors.main}>
                {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
                {market.collateralToken.symbol}
              </Text>
            </HStack>
          </HStack>
          <Flex w='full' justifyContent='center'>
            <Text {...paragraphMedium} maxW='80%' textAlign='center' color={colors.main}>
              {market.title}
            </Text>
          </Flex>
          <HStack justifyContent='space-between'>
            <DailyMarketTimer deadline={market.deadline} color={colors.main} />
            <HStack gap={1} color={colors.main}>
              <Text {...paragraphMedium} color={colors.main}>
                {market.prices[0]}%
              </Text>
              <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                <Box
                  h='100%'
                  w='100%'
                  borderRadius='100%'
                  bg={`conic-gradient(${colors.main} ${market.prices[0]}% 10%, ${colors.chartBg} ${market.prices[0]}% 100%)`}
                />
              </Box>
            </HStack>
          </HStack>
        </Flex>
      </Paper>
    </NextLink>
  )
}
