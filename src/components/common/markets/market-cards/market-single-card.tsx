import { Box, Button, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import Paper from '@/components/common/paper'
import { LineChart } from '@/app/(markets)/markets/[address]/components/line-chart'
import { MarketCardLink } from './market-card-link'
import { MarketProgressBar } from './market-progress-bar'
import { SpeedometerProgress } from './speedometer-progress'
import { useMarketFeed } from '@/hooks/use-market-feed'
import usePageName from '@/hooks/use-page-name'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import {
  ClickEvent,
  PageOpenedPage,
  QuickBetClickedMetadata,
  useAccount,
  useAmplitude,
  useTradingService,
} from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { captionMedium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

export const MIN_CARD_HEIGHT = {
  row: '196px',
  grid: '200px',
  speedometer: '200px',
  chart: '144px',
  groupRow: '196px',
}

export type MarketCardLayout = 'row' | 'grid' | 'speedometer' | 'chart' | 'groupRow'

interface DailyMarketCardProps {
  variant?: MarketCardLayout
  market: Market
  analyticParams: { bannerPosition: number; bannerPaginationPage: number }
}

export const MarketSingleCard = ({
  variant = 'row',
  market,
  analyticParams,
}: DailyMarketCardProps) => {
  const [hovered, setHovered] = useState(false)
  const [yesHovered, setYesHovered] = useState(false)
  const [noHovered, setNoHovered] = useState(false)
  const {
    onOpenMarketPage,
    market: selectedMarket,
    setMarket,
    setClobOutcome,
    marketPageOpened,
    setMarketPageOpened,
  } = useTradingService()
  const router = useRouter()
  const { data: marketFeedData } = useMarketFeed(market)
  const { pushGA4Event } = useGoogleAnalytics()
  const { closeAllAuthSidebarPages } = useAccount()
  const page = usePageName()

  const onClickRedirectToMarket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 2) {
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
      page: page as PageOpenedPage,
      ...analyticParams,
    })
    pushGA4Event(GAEvents.SelectAnyMarket)
    closeAllAuthSidebarPages()
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
  const isShortCard = isGrid || isSpeedometer || isMobile

  const handleOutcomeClicked = (e: React.MouseEvent<HTMLButtonElement>, outcome: number) => {
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Main page' + ' ' + market.tradeType + 'card',
      value: outcome ? 'small no button' : 'small yes button',
    })
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      return
    }
    if (!isMobile) {
      e.stopPropagation()
      e.preventDefault()
    }
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('market', market.slug)
    router.push(`?${searchParams.toString()}`, { scroll: false })
    setMarket(market)
    setClobOutcome(outcome)
    closeAllAuthSidebarPages()
    if (!marketPageOpened) {
      setMarketPageOpened(true)
    }
  }

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
      <Paper flex={1} w='full' position='relative' cursor='pointer' p='14px' bg='unset' h='full'>
        <Box w='full' mb='8px'>
          <MarketCountdown
            hideText={isShortCard}
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='grey.500'
          />
        </Box>
        <VStack w='full' h='calc(100% - 28px)' gap='16px' justifyContent='space-between'>
          <Flex
            w='full'
            alignItems='center'
            margin='auto'
            gap='12px'
            justifyContent='space-between'
          >
            <Text {...headline}>{market.title}</Text>
            {isSpeedometer ? (
              <Box w='56px' h='28px'>
                <SpeedometerProgress value={Number(market.prices[0].toFixed(1))} />
              </Box>
            ) : null}
          </Flex>
          <Box w='full'>
            {withChart ? <LineChart market={market} /> : null}
            {isSpeedometer ? (
              <Divider />
            ) : (
              <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />
            )}
            <HStack w='full' mt='16px' justifyContent='space-between'>
              <HStack gap='4px'>
                <HStack gap='4px'>
                  <>
                    {!isShortCard ? (
                      <HStack gap={0}>
                        {uniqueUsersTrades?.map(({ user }, index) => {
                          return (
                            <Avatar
                              account={user.account}
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
                          )
                        })}
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
                        0
                      )}{' '}
                      {market.collateralToken.symbol}
                    </Text>
                    {market.tradeType !== 'clob' && <OpenInterestTooltip iconColor='grey.500' />}
                  </>
                </HStack>
              </HStack>
              <HStack gap='8px'>
                <Button
                  {...captionMedium}
                  h='20px'
                  px='4px'
                  py='2px'
                  color={yesHovered ? 'white' : 'green.500'}
                  bg={yesHovered ? 'green.500' : 'greenTransparent.100'}
                  onMouseEnter={() => setYesHovered(true)}
                  onMouseLeave={() => setYesHovered(false)}
                  onClick={(e) => handleOutcomeClicked(e, 0)}
                >
                  {yesHovered
                    ? `${new BigNumber(market.prices[0]).decimalPlaces(0).toString()}%`
                    : 'YES'}
                </Button>
                <Button
                  {...captionMedium}
                  h='20px'
                  px='4px'
                  py='2px'
                  color={noHovered ? 'white' : 'red.500'}
                  bg={noHovered ? 'red.500' : 'redTransparent.100'}
                  onMouseEnter={() => setNoHovered(true)}
                  onMouseLeave={() => setNoHovered(false)}
                  onClick={(e) => handleOutcomeClicked(e, 1)}
                >
                  {noHovered
                    ? `${new BigNumber(market.prices[1]).decimalPlaces(0).toString()}%`
                    : 'NO'}
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Paper>
    </Box>
  )

  return <MarketCardLink marketAddress={market?.slug}>{content}</MarketCardLink>
}
