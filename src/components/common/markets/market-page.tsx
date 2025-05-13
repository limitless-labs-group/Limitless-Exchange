import {
  Box,
  Button,
  Divider,
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
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import ClobWidget from '@/components/common/markets/clob-widget/clob-widget'
import { MarketAssetPriceChart } from '@/components/common/markets/market-asset-price-chart'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketPageOverviewTab from '@/components/common/markets/market-page-overview-tab'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import MarketPositionsAmm from '@/components/common/markets/positions/market-positions-amm'
import ShareMenu from '@/components/common/markets/share-menu'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import TradingWidgetSimple from '@/components/common/markets/trading-widgets/trading-widget-simple'
import WinnerTakeAllTooltip from '@/components/common/markets/winner-take-all-tooltip'
import SideBarPage from '@/components/common/side-bar-page'
import Skeleton from '@/components/common/skeleton'
import ClobPositions from '@/app/(markets)/markets/[address]/components/clob/clob-positions'
import Orderbook from '@/app/(markets)/markets/[address]/components/clob/orderbook'
import GroupMarketsSection from '@/app/(markets)/markets/[address]/components/group-markets-section'
import { PriceChartContainer } from '@/app/(markets)/markets/[address]/components/price-chart-container'
import { LUMY_TOKENS } from '@/app/draft/components'
import CommentTab from './comment-tab'
import { MarketProgressBar } from './market-cards/market-progress-bar'
import { TopHoldersTab } from './top-holders'
import { UniqueTraders } from './unique-traders'
import usePageName from '@/hooks/use-page-name'
import { useUrlParams } from '@/hooks/use-url-param'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import ExpandIcon from '@/resources/icons/expand-icon.svg'
import LineChartIcon from '@/resources/icons/line-chart-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import OrderbookIcon from '@/resources/icons/orderbook.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import TopHolders from '@/resources/icons/top-holders-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import {
  ChangeEvent,
  ClickEvent,
  OpenEvent,
  PageOpenedPage,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useMarket } from '@/services/MarketsService'
import { h2Bold, h2Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'
import { ReferralLink } from '../referral-link'

export default function MarketPage() {
  const [activeChartTabIndex, setActiveChartTabIndex] = useState(0)
  const [activeActionsTabIndex, setActiveActionsTabIndex] = useState(0)

  const {
    setMarket,
    onCloseMarketPage,
    market,
    setStrategy,
    refetchMarkets,
    setGroupMarket,
    groupMarket,
  } = useTradingService()

  const { updateParams } = useUrlParams()

  const { trackClicked, trackOpened, trackChanged } = useAmplitude()

  const marketAddress = useMemo(() => {
    return market?.marketType === 'group' ? groupMarket?.slug : market?.slug
  }, [market, groupMarket])

  const { data: updatedMarket } = useMarket(marketAddress, !!market)

  useEffect(() => {
    if (updatedMarket) {
      if (updatedMarket.marketType === 'group') {
        setGroupMarket(updatedMarket)
        const updatedMarketInGroup = updatedMarket.markets?.find(
          (updatedM) => market?.id === updatedM.id
        )
        setMarket(updatedMarketInGroup || market)
      } else {
        setMarket(updatedMarket)
      }
      refetchMarkets()
    }
  }, [updatedMarket])

  const isLumy = market?.tags?.includes('Lumy')

  const isLivePriceSupportedMarket =
    isLumy && LUMY_TOKENS.some((token) => market?.title.toLowerCase().includes(token.toLowerCase()))

  const chartTabs = useMemo(() => {
    const tabs = [
      {
        title: 'Chart',
        icon: <LineChartIcon width={16} height={16} />,
        analyticEvent: '',
      },
    ]
    if (market?.tradeType === 'clob') {
      tabs.push({
        title: 'Order book',
        icon: <OrderbookIcon width='16px' height='16px' />,
        analyticEvent: ClickEvent.OrderBookOpened,
      })
    }
    if (isLivePriceSupportedMarket) {
      tabs.push({
        title: 'Assets price',
        icon: <CandlestickIcon width={16} height={16} />,
        analyticEvent: '',
      })
    }
    return tabs
  }, [isLivePriceSupportedMarket, market?.tradeType])

  const priceChart = useMemo(() => {
    return (
      <PriceChartContainer
        key={uuidv4()}
        slug={market?.slug}
        marketType={market?.marketType}
        ended={market?.status === MarketStatus.RESOLVED || false}
      />
    )
  }, [market?.slug])

  const chartsTabPanels = useMemo(() => {
    const tabPanels = [priceChart]
    if (market?.tradeType === 'clob') {
      tabPanels.push(<Orderbook key={uuidv4()} variant='small' />)
    }
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
    {
      title: 'Top Holders',
      icon: <TopHolders width={16} height={16} />,
    },
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketPageOverviewTab key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} isActive={activeActionsTabIndex === 1} />,
      <CommentTab key={uuidv4()} />,
      <TopHoldersTab key={uuidv4()} />,
    ]
  }, [activeActionsTabIndex])

  const handleCloseMarketPageClicked = () => {
    setMarket(null)
    updateParams({ market: null, r: null })
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
    if (!market) {
      return <Skeleton height={isMobile ? 354 : 481} />
    }
    if (market?.expired) {
      return <MarketClosedWidget handleCloseMarketPageClicked={handleCloseMarketPageClicked} />
    }
    return market?.tradeType === 'clob' ? <ClobWidget /> : <TradingWidgetSimple />
  }, [market])

  const chart = useMemo(() => {
    return groupMarket?.negRiskMarketId ? (
      <Box mb='24px'>
        <PriceChartContainer
          slug={groupMarket.slug}
          marketType='group'
          ended={market?.status === MarketStatus.RESOLVED || false}
        />
      </Box>
    ) : null
  }, [groupMarket?.negRiskMarketId])

  const page = usePageName()

  useEffect(() => {
    //avoid triggering amplitude call twice
    if (market?.slug && !trackedMarketsRef.current.has(market.slug)) {
      trackedMarketsRef.current.add(market.slug)
      trackOpened(OpenEvent.SidebarMarketOpened, {
        marketAddress: market.slug,
        marketTags: market.tags,
        marketType: 'single',
        category: market.categories,
        marketMakerType: market.tradeType.toUpperCase(),
        page: page as PageOpenedPage,
      })
    }
  }, [market?.slug])

  useEffect(() => {
    setActiveActionsTabIndex(0)
    setActiveChartTabIndex(0)
  }, [market?.slug])

  return (
    <SideBarPage>
      {!isMobile && (
        <HStack w='full' justifyContent='space-between'>
          <HStack gap='16px'>
            <Button variant='outlined' onClick={handleCloseMarketPageClicked}>
              <CloseIcon width={16} height={16} />
              Close
            </Button>
            <ReferralLink href={`/markets/${groupMarket?.slug || market?.slug}`}>
              <Button variant='outlined' onClick={handleFullPageClicked}>
                <ExpandIcon width={16} height={16} />
                Full page
              </Button>
            </ReferralLink>
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
          <MarketCountdown
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            {...paragraphRegular}
            color='grey.500'
            ended={market.status === MarketStatus.RESOLVED}
          />
        )}
        <HStack gap='6px' flexWrap='wrap'>
          <Text {...paragraphRegular} color='grey.500'>
            Created by
          </Text>
          <ChakraImage
            width={6}
            height={6}
            src={
              groupMarket?.creator.imageURI || market?.creator.imageURI || '/assets/images/logo.svg'
            }
            alt='creator'
            borderRadius={'2px'}
          />
          <Link
            href={groupMarket?.creator.link || market?.creator.link || ''}
            variant='textLinkSecondary'
            fontWeight={400}
          >
            {groupMarket?.creator.name || market?.creator.name}
          </Link>
        </HStack>
      </HStack>
      <HStack w='full' justifyContent='space-between' alignItems='flex-start'>
        <Text {...h2Bold}>{groupMarket?.title || market?.proxyTitle || market?.title}</Text>
        {isMobile && <ShareMenu />}
      </HStack>
      <Box w='full' mt='24px'>
        {market?.marketType === 'single' && (
          <MarketProgressBar isClosed={market?.expired} value={market ? market.prices[0] : 50} />
        )}
        <HStack gap='8px' mt={'8px'} flexWrap='wrap'>
          {market?.tradeType !== 'amm' && (
            <HStack gap='12px' w='full' justifyContent='space-between'>
              {groupMarket?.negRiskMarketId && <WinnerTakeAllTooltip />}
              <HStack gap='4px' color='grey.500'>
                <VolumeIcon width={16} height={16} />
                <Text {...paragraphRegular} color='grey.500'>
                  Volume
                </Text>
                <Text {...paragraphRegular} color='grey.500'>
                  {NumberUtil.convertWithDenomination(
                    groupMarket ? groupMarket.volumeFormatted : market?.volumeFormatted || '0',
                    0
                  )}{' '}
                  {market?.collateralToken.symbol}
                </Text>
              </HStack>
            </HStack>
          )}
          {market?.tradeType === 'amm' && (
            <HStack w='full' gap='4px' justifyContent='space-between'>
              <HStack gap='4px' color='grey.500'>
                <VolumeIcon width={16} height={16} />
                <Text {...paragraphRegular} color='grey.500'>
                  Volume
                </Text>
                <Text {...paragraphRegular} color='grey.500'>
                  {NumberUtil.convertWithDenomination(market?.volumeFormatted || '0', 0)}{' '}
                  {market?.collateralToken.symbol}
                </Text>
              </HStack>
              <HStack>
                <UniqueTraders color='grey.50' />
                <Text {...paragraphRegular} color='grey.500'>
                  Value
                </Text>
                <Text {...paragraphRegular} color='grey.500'>
                  {NumberUtil.convertWithDenomination(
                    market ? +market.openInterestFormatted + +market.liquidityFormatted : 0,
                    0
                  )}{' '}
                  {market?.collateralToken.symbol}
                </Text>
                <OpenInterestTooltip iconColor='grey.500' />
              </HStack>
            </HStack>
          )}
        </HStack>
        <Divider my='24px' />
      </Box>
      {chart}
      {tradingWidget}
      {groupMarket?.negRiskMarketId ? (
        <>
          <Text {...h2Medium} mt='24px'>
            Outcomes
          </Text>
          <VStack gap='8px' w='full' mb='24px' mt='8px'>
            <GroupMarketsSection mobileView={true} />
          </VStack>
        </>
      ) : (
        <Tabs
          position='relative'
          variant='common'
          my='20px'
          onChange={(index) => setActiveChartTabIndex(index)}
          index={activeChartTabIndex}
        >
          <Box
            overflowX='auto'
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <TabList whiteSpace='nowrap' width='max-content' minWidth='100%'>
              {chartTabs.map((tab, index) => (
                <Tab
                  key={tab.title}
                  onClick={() => handleChartTabClicked(tab.title)}
                  borderBottom={
                    activeChartTabIndex === index ? '2px solid black' : '2px solid transparent'
                  }
                  _selected={{ borderBottom: '2px solid black' }}
                >
                  <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                    {tab.icon}
                    <>{tab.title}</>
                  </HStack>
                </Tab>
              ))}
            </TabList>
          </Box>
          <TabPanels>
            {chartsTabPanels.map((panel, index) => (
              <TabPanel key={index} px='0'>
                {panel}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}

      {market?.marketType !== 'group' && (
        <>
          {market?.tradeType === 'clob' ? (
            <ClobPositions marketType='sidebar' />
          ) : (
            <MarketPositionsAmm />
          )}
        </>
      )}
      <Tabs
        position='relative'
        variant='common'
        onChange={(index) => setActiveActionsTabIndex(index)}
        index={activeActionsTabIndex}
      >
        <Box
          overflowX='auto'
          css={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <TabList whiteSpace='nowrap' width='max-content' minWidth='100%'>
            {tabs.map((tab, index) => (
              <Tab
                key={tab.title}
                borderBottom={
                  activeActionsTabIndex === index ? '2px solid black' : '2px solid transparent'
                }
                _selected={{ borderBottom: '2px solid black' }}
              >
                <HStack gap={isMobile ? '8px' : '4px'} w='fit-content'>
                  {tab.icon}
                  <>{tab.title}</>
                </HStack>
              </Tab>
            ))}
          </TabList>
        </Box>
        <TabPanels>
          {tabPanels.map((panel, index) => (
            <TabPanel key={index} px='0'>
              {panel}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </SideBarPage>
  )
}
