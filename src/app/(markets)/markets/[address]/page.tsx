'use client'

import {
  Box,
  Button,
  Divider,
  HStack,
  Image as ChakraImage,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import CommentTab from '@/components/common/markets/comment-tab'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import TradingWidgetAdvanced from '@/components/common/markets/trading-widgets/trading-widget-advanced'
import TradingWidgetSimple from '@/components/common/markets/trading-widgets/trading-widget-simple'
import { UniqueTraders } from '@/components/common/markets/unique-traders'
import ProgressBar from '@/components/common/progress-bar'
import Skeleton from '@/components/common/skeleton'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import PortfolioTab from '@/app/(markets)/markets/[address]/components/portfolio-tab'
import { MarketPriceChart, MarketTradingForm, MobileTradeButton } from './components'
import { MainLayout } from '@/components'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import {
  ClickEvent,
  createMarketShareUrls,
  OpenEvent,
  ShareClickedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useMarket } from '@/services/MarketsService'
import { h1Regular, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import { defineOpenInterestOverVolume } from '@/utils/market'

const MarketPage = ({ params }: { params: { address: Address } }) => {
  const [isShareMenuOpen, setShareMenuOpen] = useState(false)
  /**
   * ANALYTICS
   */
  const { trackClicked, trackOpened } = useAmplitude()
  const router = useRouter()
  const { data: market, isLoading: fetchMarketLoading } = useMarket(params.address)
  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices, market?.creator.name)
  const { setMarket, resetQuotes } = useTradingService()

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
    return market?.tradeType === 'clob' ? <TradingWidgetAdvanced /> : <TradingWidgetSimple />
  }, [market, fetchMarketLoading])

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
      title: 'Portfolio',
      icon: <PortfolioIcon width={16} height={16} />,
    },
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketOverviewTab market={market} key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} />,
      <CommentTab key={uuidv4()} />,
      <PortfolioTab key={uuidv4()} />,
    ]
  }, [market])

  const mobileTradeButton = useMemo(() => {
    if (fetchMarketLoading) {
      return
    }
    return market?.expired ? (
      <MobileTradeButton market={market} />
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
                address: market?.address,
              })
            }}
          >
            Trade
          </Button>
        }
        title={(market?.proxyTitle ?? market?.title) || ''}
        variant='blue'
      >
        <MarketTradingForm market={market as Market} />
      </MobileDrawer>
    )
  }, [market, fetchMarketLoading])

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
        marketAddress: market.address,
        page: 'Market Page',
      })
    }
  }, [market])

  return (
    <MainLayout layoutPadding={isMobile ? '0' : '4'}>
      {!market && !fetchMarketLoading ? (
        <>Market not found</>
      ) : (
        <>
          <HStack gap='40px' alignItems='flex-start' mb={isMobile ? '84px' : 0}>
            <Box w={isMobile ? 'full' : '664px'}>
              <Box px={isMobile ? '16px' : 0} mt={isMobile ? '16px' : 0}>
                <HStack justifyContent='space-between' mb='24px'>
                  <Button
                    variant='grey'
                    onClick={() => {
                      trackClicked(ClickEvent.BackClicked, {
                        address: market?.address || '0x',
                      })
                      handleBackClicked()
                    }}
                  >
                    <ArrowLeftIcon width={16} height={16} />
                    Back
                  </Button>
                  <Menu isOpen={isShareMenuOpen} onClose={() => setShareMenuOpen(false)}>
                    <MenuButton
                      onClick={() => {
                        trackClicked(ClickEvent.ShareMenuClicked, {
                          address: market?.address || '0x',
                          marketType: 'single',
                        })
                        setShareMenuOpen(true)
                      }}
                    >
                      <HStack gap='4px'>
                        <ShareIcon width={16} height={16} />
                        <Text {...paragraphMedium}>Share</Text>
                      </HStack>
                    </MenuButton>
                    <MenuList borderRadius='8px' w={isMobile ? '160px' : '122px'} zIndex={2}>
                      <MenuItem
                        onClick={() => {
                          trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                            type: 'Farcaster',
                            address: market?.address,
                            marketType: 'single',
                          })
                          window.open(castURI, '_blank', 'noopener')
                        }}
                      >
                        <HStack gap='4px'>
                          <WarpcastIcon />
                          <Text {...paragraphMedium}>On Warpcast</Text>
                        </HStack>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          trackClicked<ShareClickedMetadata>(ClickEvent.ShareItemClicked, {
                            type: 'X/Twitter',
                            address: market?.address,
                            marketType: 'single',
                          })
                          window.open(tweetURI, '_blank', 'noopener')
                        }}
                      >
                        <HStack gap='4px'>
                          <TwitterIcon width={'16px'} />
                          <Text {...paragraphMedium}>On X</Text>
                        </HStack>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                <HStack w='full' justifyContent='space-between' flexWrap='wrap' gap='4px'>
                  {!market ? (
                    <Box w='160px'>
                      <Skeleton height={20} />
                    </Box>
                  ) : (
                    <DailyMarketTimer
                      deadline={market.expirationTimestamp}
                      deadlineText={market.expirationDate}
                      color='grey.500'
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
                      <Link href={market?.creator.link}>
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
                  <HStack w='full' justifyContent='space-between'>
                    <Box w='80px'>
                      <Skeleton height={20} />
                    </Box>
                    <Box w='80px'>
                      <Skeleton height={20} />
                    </Box>
                  </HStack>
                ) : (
                  <HStack w='full' justifyContent='space-between' mb='4px'>
                    <Text {...paragraphMedium} color='#0FC591'>
                      Yes {market.prices[0]}%
                    </Text>
                    <Text {...paragraphMedium} color='#FF3756'>
                      No {market.prices[1]}%
                    </Text>
                  </HStack>
                )}
                {!market ? (
                  <Box mt='4px'>
                    <Skeleton height={16} />
                  </Box>
                ) : (
                  <ProgressBar variant='market' value={market.prices[0]} />
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
                          Volume {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
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
                        {defineOpenInterestOverVolume(
                          market.openInterestFormatted,
                          market.liquidityFormatted
                        ).showOpenInterest ? (
                          <>
                            <UniqueTraders color='grey.50' />
                            <Text {...paragraphRegular} color='grey.500'>
                              Value{' '}
                              {NumberUtil.convertWithDenomination(
                                +market.openInterestFormatted + +market.liquidityFormatted,
                                6
                              )}{' '}
                              {market.collateralToken.symbol}
                            </Text>
                            <OpenInterestTooltip iconColor='grey.500' />
                          </>
                        ) : (
                          <>
                            <Box {...paragraphRegular}>💧 </Box>
                            <Text {...paragraphRegular} color='grey.500'>
                              Liquidity{' '}
                              {NumberUtil.convertWithDenomination(market.liquidityFormatted, 6)}{' '}
                              {market.collateralToken.symbol}
                            </Text>
                          </>
                        )}
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
                  <MarketPriceChart />
                )}
              </Box>
              {fetchMarketLoading ? (
                <Box px={isMobile ? '16px' : 0}>
                  <Skeleton height={120} />
                </Box>
              ) : (
                <Tabs position='relative' variant='common' mx={isMobile ? '16px' : 0}>
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
                  <TabIndicator
                    mt='-2px'
                    height='2px'
                    bg='grey.800'
                    transitionDuration='200ms !important'
                  />
                  <TabPanels>
                    {tabPanels.map((panel, index) => (
                      <TabPanel key={index}>{panel}</TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              )}
            </Box>
            {!isMobile && tradingWidget}
          </HStack>
          {isMobile && (
            <Box position='fixed' bottom='76px' w='calc(100% - 32px)' left='16px'>
              {mobileTradeButton}
            </Box>
          )}
        </>
      )}
    </MainLayout>
  )
}

export default MarketPage
