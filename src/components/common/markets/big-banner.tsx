import { Box, Button, Divider, HStack, Text, useOutsideClick, VStack } from '@chakra-ui/react'
import { MarketSingleCardResponse } from '@/types'
import { headLineLarge, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import { NumberUtil } from '@/utils'
import React, { LegacyRef, MutableRefObject, SyntheticEvent, useRef, useState } from 'react'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import Avatar from '@/components/common/avatar'
import NextLink from 'next/link'
import { MarketTradingForm } from '@/app/(markets)/markets/[address]/components'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { dailyMarketToMarket } from '@/utils/market'
import { Address } from 'viem'
import { useSearchParams } from 'next/navigation'

interface BigBannerProps {
  market: MarketSingleCardResponse
}

export default function BigBanner({ market }: BigBannerProps) {
  const [tradingWidgetOpened, setTradingWidgetOpened] = useState(false)
  const { trackClicked } = useAmplitude()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  const ref = useRef<HTMLElement>()
  const { setMarket, market: selectedMarket } = useTradingService()

  const onClickQuickBuy = (e: SyntheticEvent) => {
    e.preventDefault()
    setTradingWidgetOpened(true)
    setMarket(dailyMarketToMarket(market))
    trackClicked(ClickEvent.QuickBetClicked, {
      // Todo add analytic params
      platform: 'desktop',
      bannerType: 'Medium banner',
      marketCategory: category,
      marketAddress: market.address as Address,
      marketType: 'single',
      source: 'Explore Market',
    })
  }

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      setTradingWidgetOpened(false)
    },
  })
  return (
    <Box position='relative'>
      <NextLink href={`/markets/${market.address}`} style={{ width: '100%' }}>
        <VStack
          w='full'
          justifyContent='space-between'
          bg='lime.500'
          p='16px'
          borderRadius='2px'
          h={'324px'}
        >
          <Text {...headLineLarge}>{market.title}</Text>
          <Box></Box>
          <Box w='full'>
            <HStack w='full' justifyContent='space-between'>
              <DailyMarketTimer deadline={market.deadline} color='black' />
              <HStack gap='16px'>
                <HStack color='black' gap='4px'>
                  <LiquidityIcon width={16} height={16} />
                  <Text {...paragraphRegular} color='black'>
                    {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
                <HStack gap='4px' color='black'>
                  <HStack color='black' gap='4px'>
                    <VolumeIcon width={16} height={16} />
                    <Text {...paragraphRegular} color='black'>
                      {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                  </HStack>
                </HStack>
                <HStack gap={1} color='black'>
                  <Text {...paragraphMedium} color='black'>
                    {market.prices[0]}%
                  </Text>
                  <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
                    <Box
                      h='100%'
                      w='100%'
                      borderRadius='100%'
                      bg={`conic-gradient(black ${market.prices[0]}% 10%, rgba(0, 0, 0, 0.2) ${market.prices[0]}% 100%)`}
                    />
                  </Box>
                </HStack>
              </HStack>
            </HStack>
            <Divider
              orientation='horizontal'
              mt={'12px'}
              mb='8px'
              w='full'
              color='rgba(0, 0, 0, 0.2)'
            />
            <HStack w='full' justifyContent='space-between'>
              <HStack gap='4px'>
                <Avatar account={''} />
                <Text {...paragraphMedium} color='black'>
                  0x0960...Bd9565 Bought 842.437 contracts NO for 100 USDC in total
                </Text>
              </HStack>
              <Button variant='black' onClick={onClickQuickBuy}>
                Quick buy
              </Button>
            </HStack>
          </Box>
        </VStack>
      </NextLink>
      {tradingWidgetOpened && selectedMarket && (
        <Box position='absolute' top='0' right={'-352px'} ref={ref as LegacyRef<HTMLDivElement>}>
          <MarketTradingForm
            market={selectedMarket}
            analyticParams={{ quickBetSource: 'Medium banner', source: 'Quick Bet' }}
          />
        </Box>
      )}
    </Box>
  )
}
