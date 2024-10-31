import { Box, HStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { SyntheticEvent, useState } from 'react'
import MobileDrawer from '@/components/common/drawer'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPage from '@/components/common/markets/market-page'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import TooltipIcon from '@/resources/icons/tooltip-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { captionMedium, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

interface DailyMarketCardMobileProps {
  market: Market
  dailyIndex: number
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

export default function DailyMarketCardMobile({
  market,
  analyticParams,
}: DailyMarketCardMobileProps) {
  const [colors] = useState(defaultColors)

  const router = useRouter()

  const { onOpenMarketPage } = useTradingService()
  const { trackClicked } = useAmplitude()

  const handleMarketPageOpened = () => {
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      ...analyticParams,
    })
    onOpenMarketPage(market, 'Medium Banner')
  }

  const isLumy = market.title.includes('COIN')

  const handleLumyButtonClicked = (e: SyntheticEvent) => {
    e.stopPropagation()
    router.push('/lumy')
  }

  const content = (
    <Box
      border='2px'
      borderColor='grey.800'
      cursor='pointer'
      py='10px'
      px='8px'
      w='full'
      style={{
        borderImage: isLumy
          ? 'linear-gradient(90deg, #5F1BEC 0%, #FF3756 27.04%, #FFCB00 99.11%) 1'
          : 'unset',
      }}
      onClick={handleMarketPageOpened}
      position='relative'
    >
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
          {market.proxyTitle ?? market.title ?? 'Noname market'}
        </Text>
      </HStack>
      <HStack justifyContent='space-between' alignItems='flex-end'>
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
      {isLumy && (
        <Box
          position='absolute'
          bottom={0}
          left='calc(50% - 30px)'
          py='2px'
          px='4px'
          borderTopLeftRadius='4px'
          borderTopRightRadius='2px'
          bg={'linear-gradient(90deg, #FF444F -14%, #FF7A30 100%)'}
          onClick={handleLumyButtonClicked}
        >
          <HStack gap='8px' color='grey.white'>
            <Text {...captionMedium} color='grey.white'>
              LUMY AI
            </Text>
            <TooltipIcon width={16} height={16} />
          </HStack>
        </Box>
      )}
    </Box>
  )

  return (
    <MobileDrawer trigger={content} variant='black' title={market.title}>
      <MarketPage />
    </MobileDrawer>
  )
}
