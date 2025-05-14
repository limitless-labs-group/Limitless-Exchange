import { Box, Button, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { MarketCardProps } from '@/components/common/markets'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { MIN_CARD_HEIGHT } from '@/components/common/markets/market-cards/market-single-card'
import Paper from '@/components/common/paper'
import { PriceChartContainer } from '@/app/(markets)/markets/[address]/components/price-chart-container'
import { MarketProgressBar } from './market-progress-bar'
import { SpeedometerProgress } from './speedometer-progress'
import { ClickEvent, useAccount, useAmplitude, useTradingService } from '@/services'
import { captionMedium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'
import OpenInterestTooltip from '../open-interest-tooltip'

export default function MarketCardTriggerSingle({
  market,
  variant = 'row',
  markets,
  analyticParams,
}: MarketCardProps) {
  const { closeAllAuthSidebarPages } = useAccount()
  const { onOpenMarketPage, setMarkets, setClobOutcome } = useTradingService()
  const router = useRouter()

  const { trackClicked } = useAmplitude()

  const handleMarketPageOpened = () => {
    closeAllAuthSidebarPages()
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      ...analyticParams,
    })
    router.push(`?market=${market.slug}`, { scroll: false })
    onOpenMarketPage(market)
    setMarkets(markets || [])
  }

  const isSpeedometer = variant === 'speedometer'
  const withChart = variant === 'chart'

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
        <Box w='full' mb='8px'>
          <MarketCountdown
            hideText
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='grey.500'
            ended={market.status === MarketStatus.RESOLVED}
          />
        </Box>
        <VStack w='full' gap='16px' justifyContent='space-between'>
          <Flex w='full' justifyContent='space-between'>
            <Text {...headline} fontSize='16px' textAlign='start' mt='12px'>
              {market.title}
            </Text>
            {isSpeedometer ? (
              <Box w='56px' h='28px'>
                <SpeedometerProgress value={Number(market.prices[0].toFixed(1))} />
              </Box>
            ) : null}
          </Flex>
          <Box w='full'>
            {withChart ? (
              <PriceChartContainer
                slug={market.slug}
                ended={market.status === MarketStatus.RESOLVED}
                marketType={market.marketType}
                showBorders={false}
              />
            ) : null}

            {isSpeedometer ? (
              <Divider />
            ) : (
              <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />
            )}
          </Box>
          <Box w='full'>
            <HStack w='full' justifyContent='space-between'>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <>
                    <HStack gap={0} />
                    <Text {...paragraphRegular} color='grey.500'>
                      {market.tradeType === 'clob' ? 'Volume' : 'Value'}
                    </Text>
                    <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                      {market.tradeType === 'clob'
                        ? NumberUtil.convertWithDenomination(market.volumeFormatted, 0)
                        : NumberUtil.convertWithDenomination(
                            +market.openInterestFormatted + +market.liquidityFormatted,
                            0
                          )}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                    {market.tradeType === 'amm' && <OpenInterestTooltip iconColor='grey.500' />}
                  </>
                </HStack>
              </HStack>
              <HStack gap='8px'>
                <Button
                  {...captionMedium}
                  h='20px'
                  px='4px'
                  py='2px'
                  color={'green.500'}
                  bg={'greenTransparent.100'}
                  onClick={() => setClobOutcome(0)}
                >
                  {'YES'}
                </Button>
                <Button
                  {...captionMedium}
                  h='20px'
                  px='4px'
                  py='2px'
                  color={'red.500'}
                  bg={'redTransparent.100'}
                  onClick={() => setClobOutcome(1)}
                >
                  {'NO'}
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Paper>
    </Box>
  )
}
