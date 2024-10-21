import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import { Market } from '@/types'

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
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export default function DailyMarketCard({ market, analyticParams }: DailyMarketCardProps) {
  const searchParams = useSearchParams()
  const [colors, setColors] = useState(defaultColors)
  const { onOpenMarketPage } = useTradingService()
  const category = searchParams.get('category')

  const { trackClicked } = useAmplitude()

  return (
    <Paper
      flex={1}
      h={isMobile ? '240px' : '160px'}
      w={isMobile ? '100%' : '100%'}
      _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
      onMouseEnter={() => {
        if (!isMobile) {
          setColors(hoverColors)
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setColors(defaultColors)
        }
      }}
      onClick={() => {
        trackClicked(ClickEvent.MarketPageOpened, {
          ...analyticParams,
          platform: isMobile ? 'mobile' : 'desktop',
          bannerType: 'Medium banner',
          source: 'Explore Market',
          marketCategory: category,
          marketAddress: market.address as Address,
          marketType: 'single',
          page: 'Market Page',
        })
        trackClicked(ClickEvent.MediumMarketBannerClicked, {
          ...analyticParams,
        })
        onOpenMarketPage(market)
      }}
      position='relative'
      cursor='pointer'
    >
      <Flex h='full' flexDirection='column' justifyContent='space-between'>
        <HStack justifyContent='space-between'>
          <HStack gap='4px' color={colors.main}>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.main}>
              {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
          <HStack gap='4px' color={colors.main}>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium} color={colors.main}>
              {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
        </HStack>
        <Flex w='full' justifyContent='center'>
          <Text {...paragraphMedium} maxW='80%' textAlign='center' color={colors.main}>
            {market.proxyTitle ?? market.title ?? 'Noname market'}
          </Text>
        </Flex>
        <HStack justifyContent='space-between'>
          <DailyMarketTimer deadline={market.expirationTimestamp} color={colors.main} />
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
  )
}
