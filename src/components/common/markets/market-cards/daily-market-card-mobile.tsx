import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import { MarketSingleCardResponse } from '@/types'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { Address } from 'viem'
import { useRouter, useSearchParams } from 'next/navigation'
import MobileDrawer from '@/components/common/drawer'
import { dailyMarketToMarket } from '@/utils/market'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'
import { isMobile } from 'react-device-detect'

interface DailyMarketCardMobileProps {
  market: MarketSingleCardResponse
  dailyIndex: number
}

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

export default function DailyMarketCardMobile({ market, dailyIndex }: DailyMarketCardMobileProps) {
  const [colors] = useState(defaultColors)

  const router = useRouter()

  const searchParams = useSearchParams()
  const { trackClicked } = useAmplitude()
  const category = searchParams.get('category')

  const { setMarket } = useTradingService()

  const trackMarketClicked = () => {
    trackClicked(ClickEvent.MarketPageOpened, {
      bannerPosition: dailyIndex,
      bannerPaginationPage: 1,
      platform: 'mobile',
      bannerType: 'Medium banner',
      source: 'Explore Market',
      marketCategory: category,
      marketAddress: market.address as Address,
      marketType: 'single',
      page: 'Market Page',
    })
  }

  const handleQuickBuyClicked = (e: SyntheticEvent) => {
    setMarket(dailyMarketToMarket(market))
    trackMarketClicked()
  }

  useEffect(() => {
    setMarket(dailyMarketToMarket(market))
  }, [market])

  return (
    <Box border='1px' borderColor='grey.800' cursor='pointer' py='10px' px='8px' w='full'>
      <HStack w='full' justifyContent='space-between'>
        <HStack color={colors.main} gap='4px'>
          <LiquidityIcon width={16} height={16} />
          <Text {...paragraphMedium} color={colors.main}>
            {NumberUtil.formatThousands(market.liquidityFormatted, 6) +
              ' ' +
              market.collateralToken.symbol}
          </Text>
        </HStack>
        <HStack color={colors.main} gap='4px'>
          <VolumeIcon width={16} height={16} />
          <Text {...paragraphMedium} color={colors.main}>
            {NumberUtil.formatThousands(market.volumeFormatted, 6)} {market.collateralToken.symbol}
          </Text>
        </HStack>
      </HStack>
      <HStack w='full' justifyContent='center' px='8px'>
        <Text {...paragraphMedium} color={colors.main} my='48px' textAlign='center'>
          {market.title}
        </Text>
      </HStack>
      <HStack justifyContent='space-between' alignItems='flex-end'>
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
      <Divider color='grey.800' opacity='0.2 !important' my='8px' />
      <HStack w='full' justifyContent='space-between'>
        <MobileDrawer
          trigger={
            <Button variant='black' onClick={handleQuickBuyClicked}>
              Quick buy
            </Button>
          }
          variant='blue'
          title={market.title}
        >
          <MarketTradingForm
            market={dailyMarketToMarket(market)}
            analyticParams={{ quickBetSource: 'Medium banner', source: 'Quick Bet' }}
          />
        </MobileDrawer>
        <Button
          variant='dashed'
          onClick={() => {
            trackClicked(ClickEvent.MarketPageOpened, {
              bannerPosition: dailyIndex,
              platform: isMobile ? 'mobile' : 'desktop',
              bannerType: 'Medium banner',
              source: 'Explore Market',
              marketCategory: category,
              marketAddress: market.address as Address,
              marketType: 'single',
              page: 'Market Page',
            })
            trackClicked(ClickEvent.MediumMarketBannerClicked, {
              bannerPosition: dailyIndex,
              bannerPaginationPage: 1,
            })
            router.push(`/markets/${market.address}`)
          }}
        >
          Open market <ArrowRightIcon width={16} height={16} />
        </Button>
      </HStack>
    </Box>
  )
}
