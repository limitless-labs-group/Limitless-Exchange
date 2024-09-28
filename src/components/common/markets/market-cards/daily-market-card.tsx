import Paper from '@/components/common/paper'
import { isMobile } from 'react-device-detect'
import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import React, { useState } from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { MarketSingleCardResponse } from '@/types'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import NextLink from 'next/link'
import { ClickEvent, useAmplitude } from '@/services'
import { useSearchParams } from 'next/navigation'

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
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export default function DailyMarketCard({ market, analyticParams }: DailyMarketCardProps) {
  const searchParams = useSearchParams()
  const [colors, setColors] = useState(defaultColors)
  // const [showQuickBetButton, setShowQuickBetButton] = useState(false)
  // const [tradeWidgetOpened, setTradeWidgetOpened] = useState(false)
  const category = searchParams.get('category')

  const { trackClicked } = useAmplitude()

  // const onClickQuickBuy = (e) => {
  //   e.stopPropagation()
  //   setTradeWidgetOpened(true)
  // }

  return (
    <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
      <Paper
        flex={1}
        h={isMobile ? '240px' : '160px'}
        w={isMobile ? '100%' : '100%'}
        _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
        onMouseEnter={() => {
          if (!isMobile) {
            // setShowQuickBetButton(true)
            setColors(hoverColors)
          }
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            setColors(defaultColors)
            // setShowQuickBetButton(false)
          }
        }}
        onClick={() => {
          trackClicked(ClickEvent.MarketPageOpened, {
            ...analyticParams,
            platform: isMobile ? 'mobile' : 'desktop',
            bannerType: 'Medium banner',
            source: 'Explore Market',
            marketCategory: category,
            marketAddress: market.address,
            marketType: 'single',
          })
          trackClicked(ClickEvent.MediumMarketBannerClicked, {
            ...analyticParams,
          })
        }}
        position='relative'
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
        {/*{showQuickBetButton && (*/}
        {/*  <Flex*/}
        {/*    h={isMobile ? '240px' : '160px'}*/}
        {/*    w={isMobile ? '100%' : '100%'}*/}
        {/*    alignItems='center'*/}
        {/*    justifyContent='center'*/}
        {/*    top='0'*/}
        {/*    position='absolute'*/}
        {/*  >*/}
        {/*    <Button variant='black' transform='rotate(-15deg)' onClick={onClickQuickBuy}>*/}
        {/*      Quick buy*/}
        {/*    </Button>*/}
        {/*  </Flex>*/}
        {/*)}*/}
      </Paper>
    </NextLink>
  )
}
