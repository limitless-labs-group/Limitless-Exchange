import Paper from '@/components/common/paper'
import { isMobile } from 'react-device-detect'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import React from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketSingleCardResponse } from '@/types'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

interface DailyMarketCardProps {
  market: MarketSingleCardResponse
}

export default function DailyMarketCard({ market }: DailyMarketCardProps) {
  return (
    <Paper flex={1} h={isMobile ? '240px' : '160px'} w={isMobile ? '100%' : '100%'}>
      <Flex h='full' flexDirection='column' justifyContent='space-between'>
        <HStack justifyContent='space-between'>
          <HStack gap='4px'>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium}>
              {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
          <HStack gap='4px'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium}>
              {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
        </HStack>
        <Flex w='full' justifyContent='center'>
          <Text {...paragraphMedium} maxW='80%' textAlign='center'>
            {market.title}
          </Text>
        </Flex>
        <HStack justifyContent='space-between'>
          <DailyMarketTimer deadline={market.deadline} color={defaultColors.main} />
          <HStack gap={1} color={defaultColors.main}>
            <Text {...paragraphMedium} color={defaultColors.main}>
              {market.prices[0]}%
            </Text>
            <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
              <Box
                h='100%'
                w='100%'
                borderRadius='100%'
                bg={`conic-gradient(${defaultColors.main} ${market.prices[0]}% 10%, ${defaultColors.chartBg} ${market.prices[0]}% 100%)`}
              />
            </Box>
          </HStack>
        </HStack>
      </Flex>
    </Paper>
  )
}
