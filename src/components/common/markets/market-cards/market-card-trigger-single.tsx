import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { MarketCardProps } from '@/components/common/markets'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { MIN_CARD_HEIGHT } from '@/components/common/markets/market-cards/market-single-card'
import MarketTimer from '@/components/common/markets/market-cards/market-timer'
import Paper from '@/components/common/paper'
import { MarketProgressBar } from './market-progress-bar'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import OpenInterestTooltip from '../open-interest-tooltip'

export const MarketCardTriggerSingle = React.memo(
  ({ market, variant = 'row', markets, analyticParams }: MarketCardProps) => {
    const { onOpenMarketPage, setMarkets } = useTradingService()
    const router = useRouter()

    const { trackClicked } = useAmplitude()

    const handleMarketPageOpened = () => {
      trackClicked(ClickEvent.MediumMarketBannerClicked, {
        ...analyticParams,
      })
      router.push(`?market=${market.slug}`, { scroll: false })
      onOpenMarketPage(market)
      setMarkets(markets)
    }

    // const isSpeedometer = variant === 'speedometer'

    return (
      <Box
        w='full'
        rounded='12px'
        border='2px solid var(--chakra-colors-grey-100)'
        p='2px'
        minH={MIN_CARD_HEIGHT[variant]}
        h='full'
        onClick={handleMarketPageOpened}
      >
        <Paper flex={1} w={'100%'} position='relative' cursor='pointer' p='14px' bg='unset'>
          <VStack w='full' gap='16px' justifyContent='space-between'>
            <Flex w='full' justifyContent='space-between'>
              <Text {...headline} fontSize='16px' textAlign='start' mt='12px'>
                {market.title}
              </Text>
              {/*{isSpeedometer ? (*/}
              {/*  <Box w='56px' h='28px'>*/}
              {/*    <SpeedometerProgress value={Number(market.prices[0].toFixed(1))} />*/}
              {/*  </Box>*/}
              {/*) : null}*/}
            </Flex>
            <Box w='full'>
              {/*{isSpeedometer ? (*/}
              {/*  <Divider />*/}
              {/*) : (*/}
              {/*  <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />*/}
              {/*)}*/}
              <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />
            </Box>
            <Box w='full'>
              <HStack w='full' justifyContent='space-between'>
                <Box w='full'>
                  <MarketCountdown
                    hideText
                    deadline={market.expirationTimestamp}
                    deadlineText={market.expirationDate}
                    {...paragraphRegular}
                    color='grey.500'
                  />
                </Box>
                <HStack gap='4px'>
                  <HStack gap='4px'>
                    <>
                      <HStack gap={0} />
                      <Text {...paragraphRegular} color='grey.500'>
                        {market.tradeType === 'clob' ? 'Volume' : 'Value'}
                      </Text>
                      <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                        {market.tradeType === 'clob'
                          ? NumberUtil.convertWithDenomination(market.volumeFormatted, 6)
                          : NumberUtil.convertWithDenomination(
                              +market.openInterestFormatted + +market.liquidityFormatted,
                              6
                            )}{' '}
                        {market.collateralToken.symbol}
                      </Text>
                      {market.tradeType === 'amm' && <OpenInterestTooltip iconColor='grey.500' />}
                    </>
                  </HStack>
                </HStack>
              </HStack>
            </Box>
          </VStack>
        </Paper>
      </Box>
    )
  }
)

MarketCardTriggerSingle.displayName = 'MarketCardTriggerSingle'
