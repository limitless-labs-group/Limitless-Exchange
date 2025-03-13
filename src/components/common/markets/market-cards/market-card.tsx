import { Box, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Avatar from '@/components/common/avatar'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import Paper from '@/components/common/paper'
import { MarketPriceChart } from '@/app/(markets)/markets/[address]/components'
import { LineChart } from '@/app/(markets)/markets/[address]/components/line-chart'
import { MarketCardLink } from './market-card-link'
import { MarketProgressBar } from './market-progress-bar'
import { SpeedometerProgress } from './speedometer-progress'
import { useMarketFeed } from '@/hooks/use-market-feed'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

export const MIN_CARD_HEIGHT = {
  row: '144px',
  grid: '164px',
  speedometer: '137px',
  chart: '144px',
}

export type MarketCardLayout = 'row' | 'grid' | 'speedometer' | 'chart'

interface DailyMarketCardProps {
  variant?: MarketCardLayout
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export const MarketCard = ({ variant = 'row', market, analyticParams }: DailyMarketCardProps) => {
  const [hovered, setHovered] = useState(false)
  const { onOpenMarketPage, market: selectedMarket } = useTradingService()
  const router = useRouter()
  const { data: marketFeedData } = useMarketFeed(market)
  const { pushGA4Event } = useGoogleAnalytics()

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2 || withChart) {
      return
    }
    e.preventDefault()
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('market', market.slug)
    router.push(`?${searchParams.toString()}`, { scroll: false })
    trackClicked(ClickEvent.MediumMarketBannerClicked, {
      marketCategory: market.categories,
      marketAddress: market.slug,
      marketType: 'single',
      marketTags: market.tags,
      ...analyticParams,
    })
    pushGA4Event(GAEvents.SelectAnyMarket)
    onOpenMarketPage(market)
  }

  const uniqueUsersTrades = useUniqueUsersTrades(marketFeedData)

  const { trackClicked } = useAmplitude()

  useEffect(() => {
    if (selectedMarket && selectedMarket.slug !== market.slug) {
      setHovered(false)
    }
    if (!selectedMarket && hovered) {
      setHovered(false)
    }
  }, [selectedMarket, market])

  const isGrid = variant === 'grid'
  const isSpeedometer = variant === 'speedometer'
  const withChart = variant === 'chart'
  const isShortCard = isGrid || isSpeedometer

  const content = (
    <Box
      w='full'
      bg={hovered && !withChart ? 'grey.100' : 'unset'}
      rounded='12px'
      border='2px solid var(--chakra-colors-grey-100)'
      p='2px'
      minH={MIN_CARD_HEIGHT[variant]}
      h='full'
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        if (selectedMarket?.slug !== market.slug) {
          setHovered(false)
        }
      }}
      onClick={(event) => {
        onClickRedirectToMarket(event)
      }}
    >
      <Paper flex={1} w='full' h='full' position='relative' cursor='pointer' p='14px' bg='unset'>
        <VStack w='full' h='full' gap='16px' justifyContent='space-between'>
          <Flex w='full' alignItems='flex-start' gap='12px' justifyContent='space-between'>
            <Text {...headline}>{market.title}</Text>
            {isSpeedometer ? (
              <Box w='56px' h='28px'>
                <SpeedometerProgress value={Number(market.prices[0].toFixed(1))} />
              </Box>
            ) : null}
          </Flex>
          <Box w='full'>
            {/* {withChart ? <MarketPriceChart market={market} /> : null} */}
            {withChart ? <LineChart market={market} /> : null}
            {isSpeedometer ? (
              <Divider />
            ) : (
              <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />
            )}
            <HStack w='full' mt='16px' justifyContent='space-between'>
              <Box w='full'>
                <DailyMarketTimer
                  hideText={isShortCard}
                  deadline={market.expirationTimestamp}
                  deadlineText={market.expirationDate}
                  {...paragraphRegular}
                  color='grey.500'
                />
              </Box>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <>
                    {!isShortCard ? (
                      <HStack gap={0}>
                        {uniqueUsersTrades?.map(({ user }, index) => (
                          <Avatar
                            account={user.account || ''}
                            avatarUrl={user.imageURI}
                            key={user.account}
                            borderColor='grey.100'
                            zIndex={100 + index}
                            border='2px solid'
                            color='grey.100 !important'
                            showBorder
                            bg='grey.100'
                            size='20px'
                            style={{
                              border: '2px solid',
                              marginLeft: index > 0 ? '-6px' : 0,
                            }}
                          />
                        ))}
                      </HStack>
                    ) : null}
                    <Text {...paragraphRegular} color='grey.500'>
                      {market.tradeType === 'clob' ? 'Volume' : 'Value'}
                    </Text>
                    <Text {...paragraphRegular} color='grey.500' whiteSpace='nowrap'>
                      {NumberUtil.convertWithDenomination(
                        market.tradeType === 'clob'
                          ? market.volumeFormatted
                          : +market.openInterestFormatted + +market.liquidityFormatted,
                        6
                      )}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                    {market.tradeType !== 'clob' && <OpenInterestTooltip iconColor='grey.500' />}
                  </>
                </HStack>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Paper>
    </Box>
  )

  return <MarketCardLink marketAddress={market?.slug}>{content}</MarketCardLink>
}
