import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import Paper from '@/components/common/paper'
import { MarketCardProps } from './market-card-mobile'
import { MarketProgressBar } from './market-progress-bar'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import OpenInterestTooltip from '../open-interest-tooltip'

export const MarketCardTrigger = React.memo(
  ({ market, markets, analyticParams }: MarketCardProps) => {
    const { onOpenMarketPage, setMarkets } = useTradingService()
    const router = useRouter()

    const { trackClicked } = useAmplitude()

    const handleMarketPageOpened = () => {
      trackClicked(ClickEvent.MediumMarketBannerClicked, {
        ...analyticParams,
      })
      router.push(`?market=${market.address}`, { scroll: false })
      onOpenMarketPage(market)
      setMarkets(markets)
    }

    return (
      <Box
        w='full'
        rounded='12px'
        border='2px solid var(--chakra-colors-grey-100)'
        p='2px'
        onClick={handleMarketPageOpened}
      >
        <Paper flex={1} w={'100%'} position='relative' cursor='pointer' p='14px' bg='unset'>
          <VStack w='full' gap='16px'>
            <Box w='full'>
              <Text {...headline} textAlign='start' mt='12px' mb='32px'>
                {market.title}
              </Text>
              <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />
            </Box>
            <Box w='full'>
              <HStack w='full' justifyContent='space-between'>
                <Box w='full'>
                  <DailyMarketTimer
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
                      <HStack gap={0}></HStack>
                      <Text {...paragraphRegular} color='grey.500'>
                        Value
                      </Text>
                      <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                        {NumberUtil.convertWithDenomination(
                          +market.openInterestFormatted + +market.liquidityFormatted,
                          6
                        )}{' '}
                        {market.collateralToken.symbol}
                      </Text>
                      <OpenInterestTooltip iconColor='grey.500' />
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

MarketCardTrigger.displayName = 'MarketCardTrigger'
