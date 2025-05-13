'use client'

import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Image as ChakraImage,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import MobileDrawer from '@/components/common/drawer'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import ClobWidget from '@/components/common/markets/clob-widget/clob-widget'
import CommentTab from '@/components/common/markets/comment-tab'
import { MarketAssetPriceChart } from '@/components/common/markets/market-asset-price-chart'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { MarketProgressBar } from '@/components/common/markets/market-cards/market-progress-bar'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import MarketPositionsAmm from '@/components/common/markets/positions/market-positions-amm'
import ShareMenu from '@/components/common/markets/share-menu'
import { TopHoldersTab } from '@/components/common/markets/top-holders'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import TradingWidgetSimple from '@/components/common/markets/trading-widgets/trading-widget-simple'
import { UniqueTraders } from '@/components/common/markets/unique-traders'
import Skeleton from '@/components/common/skeleton'
import ClobPositions from '@/app/(markets)/markets/[address]/components/clob/clob-positions'
import ClobTabs from '@/app/(markets)/markets/[address]/components/clob/clob-tabs'
import MarketMobileTradeForm from '@/app/(markets)/markets/[address]/components/clob/market-mobile-trade-form'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import PortfolioTab from '@/app/(markets)/markets/[address]/components/portfolio-tab'
import { PriceChartContainer } from '@/app/(markets)/markets/[address]/components/price-chart-container'
import { LUMY_TOKENS } from '@/app/draft/components'
import { MarketClosedButton, MarketTradingForm } from './../components'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import LineChartIcon from '@/resources/icons/line-chart-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import TopHolders from '@/resources/icons/top-holders-icon.svg'
import { ChangeEvent, ClickEvent, OpenEvent, useAmplitude, useTradingService } from '@/services'
import { h1Regular, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export interface MarketPageProps {
  fetchMarketLoading: boolean
}

export default function SingleMarketPage({ fetchMarketLoading }: MarketPageProps) {
  const { trackClicked, trackOpened, trackChanged } = useAmplitude()
  const router = useRouter()
  const { setMarket, resetQuotes, market } = useTradingService()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [activeChartTabIndex, setActiveChartTabIndex] = useState(0)

  const isLumy = market?.tags?.includes('Lumy')

  const tradingWidget = useMemo(() => {
    if (fetchMarketLoading) {
      return (
        <Box w='312px'>
          <Skeleton height={481} />
        </Box>
      )
    }
    if (market?.expired) {
      return <MarketClosedWidget handleCloseMarketPageClicked={() => router.push('/')} />
    }
    return market?.tradeType === 'clob' ? (
      <Box w='404px'>
        <ClobWidget />
      </Box>
    ) : (
      <Box w='404px'>
        <TradingWidgetSimple fullSizePage />
      </Box>
    )
  }, [market, fetchMarketLoading])

  const isLivePriceSupportedMarket =
    isLumy && LUMY_TOKENS.some((token) => market?.title.toLowerCase().includes(token.toLowerCase()))

  const chartTabs = [
    {
      title: 'Chart',
      icon: <LineChartIcon width={16} height={16} />,
    },
    {
      title: 'Assets price',
      icon: <CandlestickIcon width={16} height={16} />,
    },
  ]

  const handleChartTabClicked = (event: string) =>
    trackChanged(ChangeEvent.ChartTabChanged, {
      view: event + 'on',
      marketMarketType: market?.tradeType === 'amm' ? 'AMM' : 'CLOB',
      marketAddress: market?.slug,
    })

  const chartsTabPanels = useMemo(
    () => [
      <PriceChartContainer
        key={uuidv4()}
        marketType='single'
        slug={market?.slug}
        ended={market?.status === MarketStatus.RESOLVED || false}
      />,
      <MarketAssetPriceChart
        key={uuidv4()}
        id={LUMY_TOKENS.filter((token) => market?.title.includes(`${token} `))[0]}
      />,
    ],
    [market?.title, market?.slug]
  )

  const marketChartContent = useMemo(() => {
    if (isLivePriceSupportedMarket) {
      return (
        <Tabs
          position='relative'
          variant='common'
          mt='20px'
          onChange={(index) => setActiveChartTabIndex(index)}
          index={activeChartTabIndex}
        >
          <TabList
            overflowX='auto'
            overflowY='hidden'
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              '-ms-overflow-style': 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {chartTabs.map((tab, index) => (
              <Tab
                key={tab.title}
                onClick={() => handleChartTabClicked(tab.title)}
                borderBottom={
                  activeChartTabIndex === index ? '2px solid black' : '2px solid transparent'
                }
                _selected={{ borderBottom: '2px solid black' }}
                minW='auto'
              >
                <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                  {tab.icon}
                  <>{tab.title}</>
                </HStack>
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {chartsTabPanels.map((panel, index) => (
              <TabPanel key={index}>{panel}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )
    }
    return (
      <PriceChartContainer
        marketType='single'
        slug={market?.slug}
        ended={market?.status === MarketStatus.RESOLVED || false}
      />
    )
  }, [market?.slug])

  const tabs = [
    {
      title: 'Resolution',
      icon: <ResolutionIcon width='16px' height='16px' />,
    },
    {
      title: 'Activity',
      icon: <ActivityIcon width={16} height={16} />,
    },
    {
      title: 'Opinions',
      icon: <OpinionIcon width={16} height={16} />,
    },
    {
      title: 'Top Holders',
      icon: <TopHolders width={16} height={16} />,
    },
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketOverviewTab market={market} key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} isActive />,
      <CommentTab key={uuidv4()} />,
      <TopHoldersTab key={uuidv4()} />,
    ]
  }, [market])

  useEffect(() => {
    if (market) {
      if (market.tradeType === 'amm') {
        tabs.push({
          title: 'Portfolio',
          icon: <PortfolioIcon width={16} height={16} />,
        })
        tabPanels.push(<PortfolioTab key={uuidv4()} />)
      }
    }
  }, [market])

  const mobileTradeButton = useMemo(() => {
    if (fetchMarketLoading) {
      return
    }
    return market?.expired ? (
      <MarketClosedButton />
    ) : (
      <MobileDrawer
        trigger={
          <Button
            variant='contained'
            w='full'
            h='48px'
            mt='32px'
            color='white'
            onClick={() => {
              trackClicked(ClickEvent.TradeButtonClicked, {
                platform: 'mobile',
                address: market?.slug,
              })
            }}
          >
            Trade
          </Button>
        }
        title={(market?.proxyTitle ?? market?.title) || ''}
        variant='black'
      >
        {market?.tradeType === 'clob' ? (
          <MarketMobileTradeForm />
        ) : (
          <MarketTradingForm market={market as Market} />
        )}
      </MobileDrawer>
    )
  }, [market, fetchMarketLoading])

  const handleBackClicked = () => {
    if (window.history.length > 2) {
      return router.back()
    }
    return router.push('/')
  }

  const charts = market?.tradeType === 'clob' ? <ClobTabs /> : marketChartContent

  useEffect(() => {
    if (market) {
      setMarket(market)
    }
  }, [market])

  useEffect(() => {
    resetQuotes()
  }, [])

  useEffect(() => {
    if (market) {
      trackOpened(OpenEvent.MarketPageOpened, {
        marketAddress: market.slug,
        page: 'Market Page',
        marketMakerType: market.tradeType.toUpperCase(),
      })
    }
  }, [market])

  return (
    <HStack
      gap={{ md: '12px', xxl: '40px' }}
      w={isMobile ? 'full' : 'unset'}
      alignItems='flex-start'
      mb={isMobile ? '84px' : 0}
      ml={!isMobile ? '188px' : 'unset'}
      mt={!market ? '64px' : '24px'}
    >
      <Box w={{ sm: 'full', md: 'calc(100vw - 642px)', xxl: '716px' }}>
        <Box px={isMobile ? '16px' : 0} mt={isMobile ? '16px' : 0}>
          <HStack justifyContent='space-between' mb='24px'>
            <Button
              variant='grey'
              onClick={() => {
                trackClicked(ClickEvent.BackClicked, {
                  address: market?.slug || '0x',
                })
                handleBackClicked()
              }}
            >
              <ArrowLeftIcon width={16} height={16} />
              Back
            </Button>
            <ShareMenu />
          </HStack>
          <HStack w='full' justifyContent='space-between' flexWrap='wrap' gap='4px'>
            {!market ? (
              <Box w='160px'>
                <Skeleton height={20} />
              </Box>
            ) : (
              <MarketCountdown
                deadline={market.expirationTimestamp}
                deadlineText={market.expirationDate}
                color='grey.500'
                ended={market.status === MarketStatus.RESOLVED}
              />
            )}
            {!market ? (
              <Box w='136px'>
                <Skeleton height={20} />
              </Box>
            ) : (
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.500'>
                  Created by
                </Text>
                <ChakraImage
                  width={6}
                  height={6}
                  src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
                  alt='creator'
                  borderRadius={'2px'}
                />
                <Link href={market?.creator.link || ''}>
                  <Text color='grey.500'>{market?.creator.name}</Text>
                </Link>
              </HStack>
            )}
          </HStack>
          <Box mb='24px'>
            {fetchMarketLoading ? (
              <VStack w='full' gap='12px' mt='8px'>
                <Skeleton height={38} />
                <Skeleton height={38} />
              </VStack>
            ) : (
              <Heading
                as='h1'
                {...(isMobile ? { ...h1Regular } : {})}
                fontSize='32px'
                userSelect='text'
                fontWeight={700}
              >
                {(market?.proxyTitle ?? market?.title) || ''}
              </Heading>
            )}
          </Box>
          {!market ? (
            <Box mt='4px'>
              <Skeleton height={16} />
            </Box>
          ) : (
            <MarketProgressBar isClosed={market.expired} value={market.prices[0]} />
          )}
          <Box mt='12px'>
            <HStack w='full' justifyContent='space-between' flexWrap='wrap'>
              {!market ? (
                <Box w='120px'>
                  <Skeleton height={20} />
                </Box>
              ) : (
                <HStack gap='4px'>
                  <Text {...paragraphRegular} color='grey.500'>
                    Volume {NumberUtil.convertWithDenomination(market.volumeFormatted, 0)}{' '}
                    {market.collateralToken.symbol}
                  </Text>
                </HStack>
              )}
              {!market ? (
                <Box w='120px'>
                  <Skeleton height={20} />
                </Box>
              ) : (
                <HStack gap='4px'>
                  <>
                    <UniqueTraders color='grey.50' />
                    {market.tradeType === 'amm' && (
                      <>
                        <Text {...paragraphRegular} color='grey.500'>
                          Value{' '}
                          {NumberUtil.convertWithDenomination(
                            +market.openInterestFormatted + +market.liquidityFormatted,
                            0
                          )}{' '}
                          {market.collateralToken.symbol}
                        </Text>
                        <OpenInterestTooltip iconColor='grey.500' />
                      </>
                    )}
                  </>
                </HStack>
              )}
            </HStack>
          </Box>
          <Divider my='16px' />
          {!market ? (
            <Box my='16px'>
              <Skeleton height={290} />
            </Box>
          ) : (
            charts
          )}
          {market?.tradeType === 'clob' ? (
            <ClobPositions marketType='sidebar' />
          ) : (
            <MarketPositionsAmm />
          )}
        </Box>
        {fetchMarketLoading ? (
          <Box px={isMobile ? '16px' : 0}>
            <Skeleton height={120} />
          </Box>
        ) : (
          <Tabs
            position='relative'
            variant='common'
            mx={isMobile ? '16px' : 0}
            onChange={(index) => setActiveTabIndex(index)}
            index={activeTabIndex}
          >
            <TabList
              overflowX='auto'
              overflowY='hidden'
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
                '-ms-overflow-style': 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.title}
                  borderBottom={
                    activeTabIndex === index ? '2px solid black' : '2px solid transparent'
                  }
                  _selected={{ borderBottom: '2px solid black' }}
                  minW='auto'
                >
                  <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                    {tab.icon}
                    <>{tab.title}</>
                  </HStack>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {tabPanels.map((panel, index) => (
                <TabPanel key={index}>{panel}</TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </Box>
      {!isMobile && tradingWidget}
      {isMobile && (
        <Box position='fixed' bottom='86px' w='calc(100% - 32px)' left='16px' zIndex={99999}>
          {mobileTradeButton}
        </Box>
      )}
    </HStack>
  )
}
