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
import React, { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Avatar from '@/components/common/avatar'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import ClobWidget from '@/components/common/markets/clob-widget/clob-widget'
import CommentTab from '@/components/common/markets/comment-tab'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import ShareMenu from '@/components/common/markets/share-menu'
import { TopHoldersTab } from '@/components/common/markets/top-holders'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import TradingWidgetSimple from '@/components/common/markets/trading-widgets/trading-widget-simple'
import { UniqueTraders } from '@/components/common/markets/unique-traders'
import WinnerTakeAllTooltip from '@/components/common/markets/winner-take-all-tooltip'
import Skeleton from '@/components/common/skeleton'
import GroupMarketsSection from '@/app/(markets)/markets/[address]/components/group-markets-section'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import PortfolioTab from '@/app/(markets)/markets/[address]/components/portfolio-tab'
import { PriceChartContainer } from '@/app/(markets)/markets/[address]/components/price-chart-container'
import { MarketPageProps } from '@/app/(markets)/markets/[address]/components/single-market-page'
import { useMarketFeed } from '@/hooks/use-market-feed'
import usePageName from '@/hooks/use-page-name'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import TopHolders from '@/resources/icons/top-holders-icon.svg'
import { ClickEvent, OpenEvent, useAmplitude, useTradingService } from '@/services'
import { h1Regular, h2Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export default function GroupMarketPage({ fetchMarketLoading }: MarketPageProps) {
  const { trackClicked, trackOpened } = useAmplitude()
  const router = useRouter()
  const { setMarket, resetQuotes, market, groupMarket } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(groupMarket)
  const uniqueUsersTrades = useUniqueUsersTrades(marketFeedData)
  const [activeTabIndex, setActiveTabIndex] = React.useState(0)
  const pageName = usePageName()

  const tradingWidget = useMemo(() => {
    if (fetchMarketLoading) {
      return (
        <Box w='404px'>
          <Skeleton height={481} />
        </Box>
      )
    }
    if (market?.expired) {
      return <MarketClosedWidget handleCloseMarketPageClicked={() => router.push('/')} />
    }
    return market?.tradeType === 'clob' ? (
      <Box w='404px' position='fixed'>
        <ClobWidget />
      </Box>
    ) : (
      <Box w='404px' position='fixed'>
        <TradingWidgetSimple fullSizePage />
      </Box>
    )
  }, [market, fetchMarketLoading])

  const tabs = useMemo(() => {
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
    ]
    if (market?.tradeType !== 'amm') {
      tabs.push({ title: 'Top Holders', icon: <TopHolders width={16} height={16} /> })
    }
    return tabs
  }, [])

  const tabPanels = useMemo(() => {
    const panels = [
      <MarketOverviewTab market={market} key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} isActive={true} />,
      <CommentTab key={uuidv4()} />,
    ]
    if (market?.tradeType !== 'amm') {
      panels.push(<TopHoldersTab key={uuidv4()} />)
    }
    return panels
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

  const handleBackClicked = () => {
    if (window.history.length > 2) {
      return router.back()
    }
    return router.push('/')
  }

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
    <>
      <Box
        w={isMobile ? 'full' : 'unset'}
        alignItems='flex-start'
        mb={isMobile ? '84px' : 0}
        ml={!isMobile ? '188px' : 'unset'}
        mt={!market ? '64px' : '24px'}
      >
        <HStack justifyContent='space-between' mb='24px' px={isMobile ? '16px' : 0}>
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
        <HStack gap={{ md: '12px', xxl: '40px' }} alignItems='flex-start'>
          <Box w={{ sm: 'full', md: 'calc(100vw - 642px)', xxl: '716px' }}>
            <Box px={isMobile ? '16px' : 0} mt={isMobile ? '16px' : 0}>
              <HStack w='full' flexWrap='wrap' gap='16px' justifyContent='space-between'>
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
                      src={groupMarket?.creator.imageURI ?? '/assets/images/logo.svg'}
                      alt='creator'
                      borderRadius={'2px'}
                    />
                    <Link href={groupMarket?.creator.link || ''}>
                      <Text color='grey.500'>{groupMarket?.creator.name}</Text>
                    </Link>
                  </HStack>
                )}
              </HStack>
              <Box mb='24px' mt='12px'>
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
                    {(groupMarket?.proxyTitle ?? groupMarket?.title) || ''}
                  </Heading>
                )}
              </Box>
              <Box mt='12px'>
                <HStack w='full' justifyContent='space-between' flexWrap='wrap'>
                  {!market ? (
                    <Box w='120px'>
                      <Skeleton height={20} />
                    </Box>
                  ) : (
                    <HStack gap='16px' w='full' justifyContent='space-between'>
                      <WinnerTakeAllTooltip />
                      <HStack gap='4px'>
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
                        <Text {...paragraphRegular} color='grey.500'>
                          Volume{' '}
                          {NumberUtil.convertWithDenomination(
                            groupMarket?.volumeFormatted || '0',
                            0
                          )}{' '}
                          {market.collateralToken.symbol}
                        </Text>
                      </HStack>
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
              <PriceChartContainer
                slug={groupMarket?.slug}
                marketType='group'
                ended={market?.status === MarketStatus.RESOLVED || false}
              />
            </Box>
            <Text {...h2Medium} mt='24px' px={isMobile ? '16px' : 0}>
              Outcomes
            </Text>
            <VStack gap='8px' w='full' mb='24px' mt='8px' px={isMobile ? '16px' : 0}>
              {fetchMarketLoading ? (
                [...Array(3)].map((item) => (
                  <Box w='full' key={item}>
                    <Skeleton height={80} />
                  </Box>
                ))
              ) : (
                <GroupMarketsSection mobileView={isMobile} />
              )}
            </VStack>
            {fetchMarketLoading ? (
              <Box px={isMobile ? '16px' : 0}>
                <Skeleton height={120} />
              </Box>
            ) : (
              <Tabs
                position='relative'
                variant='common'
                mx={isMobile ? '16px' : 0}
                onChange={(index) => {
                  trackClicked(ClickEvent.TopHoldersTabClicked, {
                    page: pageName,
                  })

                  setActiveTabIndex(index)
                }}
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
          {!isMobile && (
            <Box w='404px' position='relative'>
              {tradingWidget}
            </Box>
          )}
        </HStack>
      </Box>
    </>
  )
}
