import {
  Box,
  Button,
  Divider,
  HStack,
  Image as ChakraImage,
  Link,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { LegacyRef, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import { MarketAssetPriceChart } from '@/components/common/markets/market-asset-price-chart'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPageOverviewTab from '@/components/common/markets/market-page-overview-tab'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import MarketPositionsAmm from '@/components/common/markets/positions/market-positions-amm'
import ShareMenu from '@/components/common/markets/share-menu'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import TradingWidgetAdvanced from '@/components/common/markets/trading-widgets/trading-widget-advanced'
import TradingWidgetSimple from '@/components/common/markets/trading-widgets/trading-widget-simple'
import { MarketPriceChart } from '@/app/(markets)/markets/[address]/components'
import ClobPositions from '@/app/(markets)/markets/[address]/components/clob/clob-positions'
import Orderbook from '@/app/(markets)/markets/[address]/components/clob/orderbook'
import { LUMY_TOKENS } from '@/app/draft/components'
import CommentTab from './comment-tab'
import { MarketProgressBar } from './market-cards/market-progress-bar'
import { UniqueTraders } from './unique-traders'
import useMarketGroup from '@/hooks/use-market-group'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import ExpandIcon from '@/resources/icons/expand-icon.svg'
import LineChartIcon from '@/resources/icons/line-chart-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import OrderbookIcon from '@/resources/icons/orderbook.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ChangeEvent, ClickEvent, OpenEvent, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { h2Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function MarketPage() {
  const [activeChartTabIndex, setActiveChartTabIndex] = useState(0)
  const [activeActionsTabIndex, setActiveActionsTabIndex] = useState(0)

  const scrollableBlockRef: LegacyRef<HTMLDivElement> | null = useRef(null)

  const {
    setMarket,
    onCloseMarketPage,
    market,
    setStrategy,
    marketGroup,
    setMarketGroup,
    refetchMarkets,
  } = useTradingService()

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { trackClicked, trackOpened, trackChanged } = useAmplitude()

  const marketAddress = useMemo(() => market?.slug, [market])
  const marketGroupSlug = useMemo(() => marketGroup?.slug, [marketGroup])

  const { data: updatedMarket } = useMarket(marketAddress, !!market)
  const { data: updatedMarketGroup } = useMarketGroup(marketGroupSlug, !!marketGroup)

  useEffect(() => {
    if (updatedMarket) {
      setMarket(updatedMarket)
      refetchMarkets()
    }
  }, [updatedMarket])

  useEffect(() => {
    if (updatedMarketGroup) {
      setMarketGroup(updatedMarketGroup)
      refetchMarkets()
    }
  }, [updatedMarketGroup])

  const isLumy = market?.tags?.includes('Lumy')

  const isLivePriceSupportedMarket =
    isLumy && LUMY_TOKENS.some((token) => market?.title.toLowerCase().includes(token.toLowerCase()))

  const chartTabs = useMemo(() => {
    const tabs = []
    if (market?.tradeType === 'clob') {
      tabs.push({
        title: 'Orderbook',
        icon: <OrderbookIcon width='16px' height='16px' />,
        analyticEvent: ClickEvent.OrderBookOpened,
      })
    }
    tabs.push({
      title: 'Chart',
      icon: <LineChartIcon width={16} height={16} />,
    })
    if (isLivePriceSupportedMarket) {
      tabs.push({
        title: 'Assets price',
        icon: <CandlestickIcon width={16} height={16} />,
      })
    }
    return tabs
  }, [isLivePriceSupportedMarket, market?.tradeType])

  const chartsTabPanels = useMemo(() => {
    const tabPanels = []
    if (market?.tradeType === 'clob') {
      tabPanels.push(<Orderbook key={uuidv4()} variant='small' />)
    }
    tabPanels.push(<MarketPriceChart key={uuidv4()} />)
    if (isLivePriceSupportedMarket) {
      tabPanels.push(
        <MarketAssetPriceChart
          key={uuidv4()}
          id={LUMY_TOKENS.filter((token) => market?.title.includes(`${token} `))[0]}
        />
      )
    }
    return tabPanels
  }, [isLivePriceSupportedMarket, market?.title, market?.tradeType])

  const tabs = [
    {
      title: 'Resolution',
      icon: <ResolutionIcon width={16} height={16} />,
    },
    {
      title: 'Activity',
      icon: <ActivityIcon width={16} height={16} />,
    },
    {
      title: 'Opinions',
      icon: <OpinionIcon width={16} height={16} />,
    },
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketPageOverviewTab key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} isActive={activeActionsTabIndex === 1} />,
      <CommentTab key={uuidv4()} />,
    ]
  }, [activeActionsTabIndex])

  const removeMarketQuery = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('market')
    const newQuery = params.toString()
    router.replace(newQuery ? `${pathname}/?${newQuery}` : pathname)
  }

  const handleCloseMarketPageClicked = () => {
    setMarket(null)
    setMarketGroup(null)
    removeMarketQuery()
    onCloseMarketPage()
    trackClicked(ClickEvent.CloseMarketClicked, {
      marketAddress: market?.slug as Address,
    })
  }

  const handleFullPageClicked = () => {
    trackClicked(ClickEvent.FullPageClicked, {
      marketAddress: market?.slug,
      marketType: 'single',
      marketTags: market?.tags,
    })
  }

  const handleChartTabClicked = (event: string) =>
    trackChanged(ChangeEvent.ChartTabChanged, {
      view: event + 'on',
      marketMarketType: market?.tradeType === 'amm' ? 'AMM' : 'CLOB',
      marketAddress: market?.slug,
    })

  useEffect(() => {
    setStrategy('Buy')
  }, [])

  const trackedMarketsRef = useRef(new Set<string>())

  const tradingWidget = useMemo(() => {
    if (market?.expired) {
      return <MarketClosedWidget handleCloseMarketPageClicked={handleCloseMarketPageClicked} />
    }
    return market?.tradeType === 'clob' ? <TradingWidgetAdvanced /> : <TradingWidgetSimple />
  }, [market])

  useEffect(() => {
    //avoid triggering amplitude call twice
    if (market?.slug && !trackedMarketsRef.current.has(market.slug)) {
      trackedMarketsRef.current.add(market.slug)
      trackOpened(OpenEvent.SidebarMarketOpened, {
        marketAddress: market.slug,
        marketTags: market.tags,
        marketType: 'single',
        category: market.category,
        marketMakerType: market.tradeType.toUpperCase(),
      })
    }
  }, [market?.slug])

  useEffect(() => {
    const handleMouseEnter = () => {
      document.body.style.overflow = 'hidden'
    }

    const handleMouseLeave = () => {
      document.body.style.overflow = ''
    }

    const scrollContainer = scrollableBlockRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', handleMouseEnter)
      scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      }
      document.body.style.overflow = '' // Clean up on unmount
    }
  }, [])

  useEffect(() => {
    setActiveActionsTabIndex(0)
    setActiveChartTabIndex(0)
  }, [market])

  return (
    <Box
      bg='var(--chakra-colors-background-97)'
      borderLeft={isMobile ? 'unset' : '1px solid'}
      borderColor='grey.100'
      w={isMobile ? 'full' : '488px'}
      position={isMobile ? 'relative' : 'fixed'}
      height={isMobile ? 'calc(100dvh - 21px)' : 'calc(100vh - 21px)'}
      top='20px'
      right={0}
      overflowY='auto'
      p={isMobile ? '12px' : '16px'}
      pt={isMobile ? 0 : '16px'}
      ref={scrollableBlockRef}
      id='side-menu-scroll-container'
      boxShadow='-4px 0px 8px 0px rgba(0, 0, 0, 0.05)'
      backdropFilter='blur(7.5px)'
      zIndex='200'
    >
      {!isMobile && (
        <HStack w='full' justifyContent='space-between'>
          <HStack gap='16px'>
            <Button variant='grey' onClick={handleCloseMarketPageClicked}>
              <CloseIcon width={16} height={16} />
              Close
            </Button>
            <NextLink href={`/markets/${market?.slug}`}>
              <Button variant='grey' onClick={handleFullPageClicked}>
                <ExpandIcon width={16} height={16} />
                Full page
              </Button>
            </NextLink>
          </HStack>
          <ShareMenu />
        </HStack>
      )}
      <HStack
        w='full'
        mb='12px'
        justifyContent='space-between'
        mt={isMobile ? 0 : '24px'}
        flexWrap='wrap'
      >
        {market && (
          <DailyMarketTimer
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='grey.500'
          />
        )}
        <HStack gap='6px' flexWrap='wrap'>
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
          <Link href={market?.creator.link} variant='textLinkSecondary' fontWeight={400}>
            {market?.creator.name}
          </Link>
        </HStack>
      </HStack>
      <HStack w='full' justifyContent='space-between' alignItems='flex-start'>
        <Text {...h2Bold}>{marketGroup?.title || market?.proxyTitle || market?.title}</Text>
        {isMobile && <ShareMenu />}
      </HStack>
      <Box w='full' mt={isMobile ? '56px' : '24px'}>
        <MarketProgressBar isClosed={market?.expired} value={market ? market.prices[0] : 50} />
        <HStack gap='8px' justifyContent='space-between' mt='8px' flexWrap='wrap'>
          <HStack w={isMobile ? 'full' : 'unset'} gap='4px' color='grey.500'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphRegular} color='grey.500'>
              Volume
            </Text>
            <Text {...paragraphRegular} color='grey.500'>
              {NumberUtil.convertWithDenomination(market?.volumeFormatted || '0', 6)}{' '}
              {market?.collateralToken.symbol}
            </Text>
          </HStack>
          {market?.tradeType === 'amm' && (
            <HStack w={isMobile ? 'full' : 'unset'} gap='4px'>
              <UniqueTraders color='grey.50' />
              <Text {...paragraphRegular} color='grey.500'>
                Value
              </Text>
              <Text {...paragraphRegular} color='grey.500'>
                {NumberUtil.convertWithDenomination(
                  market ? +market.openInterestFormatted + +market.liquidityFormatted : 0,
                  6
                )}{' '}
                {market?.collateralToken.symbol}
              </Text>
              <OpenInterestTooltip iconColor='grey.500' />
            </HStack>
          )}
        </HStack>
        <Divider my={isMobile ? '24px' : '16px'} />
      </Box>
      {tradingWidget}
      <Tabs
        position='relative'
        variant='common'
        my='20px'
        onChange={(index) => setActiveChartTabIndex(index)}
        index={activeChartTabIndex}
      >
        <TabList>
          {chartTabs.map((tab) => (
            <Tab key={tab.title} onClick={() => handleChartTabClicked(tab.title)}>
              <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                {tab.icon}
                <>{tab.title}</>
              </HStack>
            </Tab>
          ))}
        </TabList>
        <TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />
        <TabPanels>
          {chartsTabPanels.map((panel, index) => (
            <TabPanel key={index}>{panel}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {market?.tradeType === 'clob' ? (
        <ClobPositions marketType='sidebar' />
      ) : (
        <MarketPositionsAmm />
      )}

      <Tabs
        position='relative'
        variant='common'
        onChange={(index) => setActiveActionsTabIndex(index)}
        index={activeActionsTabIndex}
      >
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.title}>
              <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                {tab.icon}
                <>{tab.title}</>
              </HStack>
            </Tab>
          ))}
        </TabList>
        <TabIndicator mt='-2px' height='2px' bg='grey.800' transitionDuration='200ms !important' />
        <TabPanels>
          {tabPanels.map((panel, index) => (
            <TabPanel key={index}>{panel}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  )
}
