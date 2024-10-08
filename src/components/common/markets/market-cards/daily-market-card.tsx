import React, {
  LegacyRef,
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { Box, Button, Flex, HStack, Text, useOutsideClick } from '@chakra-ui/react'
import NextLink from 'next/link'
import Paper from '@/components/common/paper'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'
import { MarketSingleCardResponse } from '@/types'
import { dailyMarketToMarket } from '@/utils/market'

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
  indexAtTable: number
}

export default function DailyMarketCard({
  market,
  analyticParams,
  indexAtTable,
}: DailyMarketCardProps) {
  const ref = useRef<HTMLElement>()
  const searchParams = useSearchParams()
  const [colors, setColors] = useState(defaultColors)
  const [tradingWidgetOpened, setTradingWidgetOpened] = useState(false)
  const [showQuickBetButton, setShowQuickBetButton] = useState(false)
  const { setMarket, market: selectedMarket } = useTradingService()
  const category = searchParams.get('category')

  const { trackClicked } = useAmplitude()

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      setTradingWidgetOpened(false)
    },
  })

  const onClickQuickBuy = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTradingWidgetOpened(true)
    setColors(hoverColors)
    setMarket(dailyMarketToMarket(market))
    trackClicked(ClickEvent.QuickBetClicked, {
      ...analyticParams,
      platform: isMobile ? 'mobile' : 'desktop',
      bannerType: 'Medium banner',
      marketCategory: category,
      marketAddress: market.address as Address,
      marketType: 'single',
      source: 'Explore Market',
    })
  }

  useEffect(() => {
    if (!tradingWidgetOpened) {
      setShowQuickBetButton(false)
      setColors(defaultColors)
      setMarket(null)
    }
  }, [tradingWidgetOpened])

  useEffect(() => {
    setMarket(dailyMarketToMarket(market))
  }, [market])

  return (
    <Box position='relative'>
      <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
        <Paper
          flex={1}
          h={isMobile ? '240px' : '160px'}
          w={isMobile ? '100%' : '100%'}
          _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
          bg={tradingWidgetOpened ? 'blue.500' : 'grey.200'}
          onMouseEnter={() => {
            if (!isMobile) {
              setShowQuickBetButton(true)
              setColors(hoverColors)
            }
          }}
          onMouseLeave={() => {
            if (!isMobile && !tradingWidgetOpened) {
              setColors(defaultColors)
              setShowQuickBetButton(false)
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
                {market.proxyTitle ?? market.title ?? 'Noname market'}
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
          {showQuickBetButton && (
            <Flex
              h={isMobile ? '240px' : '160px'}
              w={isMobile ? '100%' : '100%'}
              alignItems='flex-end'
              justifyContent='center'
              bottom='4px'
              position='absolute'
            >
              <Button variant='white' onClick={onClickQuickBuy}>
                Quick buy
              </Button>
            </Flex>
          )}
        </Paper>
      </NextLink>
      {tradingWidgetOpened && selectedMarket && (
        <Box
          position='absolute'
          top='0'
          right={indexAtTable % 2 !== 0 ? '-688px' : '-352px'}
          ref={ref as LegacyRef<HTMLDivElement>}
        >
          <MarketTradingForm
            market={selectedMarket}
            analyticParams={{ quickBetSource: 'Medium banner', source: 'Quick Bet' }}
            showTitle={true}
          />
        </Box>
      )}
    </Box>
  )
}
