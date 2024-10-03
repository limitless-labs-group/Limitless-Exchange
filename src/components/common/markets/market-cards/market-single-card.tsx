import VolumeIcon from '@/resources/icons/volume-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { MarketSingleCardResponse } from '@/types'
import { NumberUtil } from '@/utils'
import { Box, Button, Divider, HStack, Text, useOutsideClick } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import React, {
  LegacyRef,
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import {
  ClickEvent,
  OpenEvent,
  PageOpenedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { dailyMarketToMarket } from '@/utils/market'
import { Address } from 'viem'
import { useRouter, useSearchParams } from 'next/navigation'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'
import MobileDrawer from '@/components/common/drawer'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'

interface MarketSingleCardProps {
  market: MarketSingleCardResponse
  position: number
  positionFromBottom: number
}

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

export const MarketSingleCard = ({
  market,
  position,
  positionFromBottom,
}: MarketSingleCardProps) => {
  const router = useRouter()
  const [colors, setColors] = useState(defaultColors)
  const { trackOpened, trackClicked } = useAmplitude()
  const searchParams = useSearchParams()
  const [tradingWidgetOpened, setTradingWidgetOpened] = useState(false)
  const [showQuickBetButton, setShowQuickBetButton] = useState(false)

  const ref = useRef<HTMLElement>()

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      setTradingWidgetOpened(false)
    },
  })

  useEffect(() => {
    if (!tradingWidgetOpened) {
      setShowQuickBetButton(false)
      setColors(defaultColors)
      setMarket(null)
    }
  }, [tradingWidgetOpened])

  const category = searchParams.get('category')

  const { setMarket, market: selectedMarket } = useTradingService()

  const trackMarketClicked = () => {
    trackOpened<PageOpenedMetadata>(OpenEvent.PageOpened, {
      page: 'Market Page',
      market: market.address,
      marketType: 'single',
    })
  }

  const onClickQuickBuy = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTradingWidgetOpened(true)
    setColors(hoverColors)
    setMarket(dailyMarketToMarket(market))
    trackClicked(ClickEvent.QuickBetClicked, {
      bannerPosition: position,
      platform: isMobile ? 'mobile' : 'desktop',
      bannerType: 'Standard card',
      marketCategory: category,
      marketAddress: market.address as Address,
      marketType: 'single',
      source: 'Explore Market',
    })
  }

  const handleQuickBuyClicked = (e: SyntheticEvent) => {
    setMarket(dailyMarketToMarket(market))
    trackMarketClicked()
  }

  useEffect(() => {
    if (!tradingWidgetOpened) {
      setShowQuickBetButton(false)
      setColors(defaultColors)
      setMarket(null)
    }
  }, [tradingWidgetOpened])

  const content = (
    <Paper
      w={'full'}
      justifyContent={'space-between'}
      cursor='pointer'
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
      onClick={trackMarketClicked}
      position='relative'
    >
      {showQuickBetButton && (
        <Button
          variant='black'
          position='absolute'
          transform='rotate(-15deg)'
          top='16px'
          onClick={onClickQuickBuy}
        >
          Quick buy
        </Button>
      )}
      <HStack justifyContent='space-between' mb='12px' alignItems='flex-start'>
        <Text {...paragraphMedium} color={colors.main}>
          {market.proxyTitle ?? market.title ?? 'Noname market'}
        </Text>
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
      <HStack
        justifyContent='space-between'
        alignItems='flex-end'
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <HStack
          gap={isMobile ? '8px' : '16px'}
          mt={isMobile ? '16px' : '8px'}
          flexDirection={isMobile ? 'column' : 'row'}
          w='full'
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
              {NumberUtil.formatThousands(market.liquidityFormatted, 6) +
                ' ' +
                market.collateralToken.symbol}
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
              {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
              {market.collateralToken.symbol}
            </Text>
          </HStack>
        </HStack>
      </HStack>
      {isMobile && (
        <>
          <Divider bg='grey.800' opacity='0.2 !important' mt='16px' mb='8px' />
          <HStack w='full' justifyContent='space-between'>
            <MobileDrawer
              trigger={
                <Button variant='dashed' onClick={handleQuickBuyClicked}>
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
              variant='transparent'
              onClick={() => {
                trackClicked(ClickEvent.MarketPageOpened, {
                  bannerPosition: position,
                  platform: 'mobile',
                  bannerType: 'Standard banner',
                  source: 'Explore Market',
                  marketCategory: category,
                  marketAddress: market.address as Address,
                  marketType: 'single',
                  page: 'Market Page',
                })
                trackClicked(ClickEvent.MediumMarketBannerClicked, {
                  bannerPosition: position,
                  bannerPaginationPage: 1,
                })
                router.push(`/markets/${market.address}`)
              }}
            >
              Open market <ArrowRightIcon width={16} height={16} />
            </Button>
          </HStack>
        </>
      )}
    </Paper>
  )

  return isMobile ? (
    content
  ) : (
    <Box w='full' position='relative'>
      <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
        {content}
      </NextLink>
      {tradingWidgetOpened && selectedMarket && (
        <Box
          position='absolute'
          top={positionFromBottom > -7 ? 'unset' : '0'}
          bottom={positionFromBottom > -7 ? '0' : 'unset'}
          right={'-352px'}
          ref={ref as LegacyRef<HTMLDivElement>}
        >
          <MarketTradingForm
            market={selectedMarket}
            analyticParams={{ quickBetSource: 'Standard banner', source: 'Quick Bet' }}
            showTitle={true}
          />
        </Box>
      )}
    </Box>
  )
}
