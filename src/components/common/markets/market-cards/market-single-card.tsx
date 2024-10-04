import VolumeIcon from '@/resources/icons/volume-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { MarketSingleCardResponse } from '@/types'
import { NumberUtil } from '@/utils'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import React, { LegacyRef, SyntheticEvent, useEffect, useRef, useState } from 'react'
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
import { useSearchParams } from 'next/navigation'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'

interface MarketSingleCardProps {
  market: MarketSingleCardResponse
  position: number
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

export const MarketSingleCard = ({ market, position }: MarketSingleCardProps) => {
  const [colors, setColors] = useState(defaultColors)
  const { trackOpened, trackClicked } = useAmplitude()
  const searchParams = useSearchParams()
  const [tradingWidgetOpened, setTradingWidgetOpened] = useState(false)
  const [showQuickBetButton, setShowQuickBetButton] = useState(false)

  const ref = useRef<HTMLElement>()

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
      bannerType: 'Standart card',
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

  const content = (
    <Paper
      w={'full'}
      justifyContent={'space-between'}
      cursor='pointer'
      _hover={{ ...(!isMobile ? { bg: 'blue.500' } : {}) }}
      onMouseEnter={() => {
        if (!isMobile) {
          // setShowQuickBetButton(true)
          setColors(hoverColors)
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !tradingWidgetOpened) {
          setColors(defaultColors)
          // setShowQuickBetButton(false)
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
    </Paper>
  )

  return isMobile ? (
    // Todo remove after phase 6 is implemented
    <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
      {content}
    </NextLink>
  ) : (
    <>
      <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
        {content}
      </NextLink>
      {tradingWidgetOpened && selectedMarket && (
        <Box position='absolute' top='0' right={'-352px'} ref={ref as LegacyRef<HTMLDivElement>}>
          <MarketTradingForm
            market={selectedMarket}
            analyticParams={{ quickBetSource: 'Medium banner', source: 'Quick Bet' }}
            showTitle={true}
          />
        </Box>
      )}
    </>
  )
}
