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
  VStack,
  Heading,
  Accordion,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Avatar from '@/components/common/avatar'
import MobileDrawer from '@/components/common/drawer'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import CommentTab from '@/components/common/markets/comment-tab'
import ConvertModal from '@/components/common/markets/convert-modal'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import ShareMenu from '@/components/common/markets/share-menu'
import MarketClosedWidget from '@/components/common/markets/trading-widgets/market-closed-widget'
import TradingWidgetAdvanced from '@/components/common/markets/trading-widgets/trading-widget-advanced'
import TradingWidgetSimple from '@/components/common/markets/trading-widgets/trading-widget-simple'
import { UniqueTraders } from '@/components/common/markets/unique-traders'
import WinnerTakeAllTooltip from '@/components/common/markets/winner-take-all-tooltip'
import Skeleton from '@/components/common/skeleton'
import { Tooltip } from '@/components/common/tooltip'
import MarketMobileTradeForm from '@/app/(markets)/markets/[address]/components/clob/market-mobile-trade-form'
import GroupMarketsSection from '@/app/(markets)/markets/[address]/components/group-markets-section'
import { mockPriceHistories } from '@/app/(markets)/markets/[address]/components/mock-chart-data'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import PortfolioTab from '@/app/(markets)/markets/[address]/components/portfolio-tab'
import { PriceChartContainer } from '@/app/(markets)/markets/[address]/components/price-chart-container'
import { MarketPageProps } from '@/app/(markets)/markets/[address]/components/single-market-page'
import { MarketTradingForm, MarketClosedButton } from './../components'
import { useMarketFeed } from '@/hooks/use-market-feed'
import { useUniqueUsersTrades } from '@/hooks/use-unique-users-trades'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import TrophyIcon from '@/resources/icons/trophy-icon.svg'
import { ClickEvent, OpenEvent, useAmplitude, useTradingService } from '@/services'
import { h1Regular, h2Medium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

export default function GroupMarketPage({ fetchMarketLoading }: MarketPageProps) {
  /**
   * ANALYTICS
   */
  const { trackClicked, trackOpened } = useAmplitude()
  const router = useRouter()
  const { setMarket, resetQuotes, market, groupMarket } = useTradingService()
  const { data: marketFeedData } = useMarketFeed(groupMarket)
  const uniqueUsersTrades = useUniqueUsersTrades(marketFeedData)

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
        <TradingWidgetAdvanced />
      </Box>
    ) : (
      <Box w='404px'>
        <TradingWidgetSimple fullSizePage />
      </Box>
    )
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
  ]

  const tabPanels = useMemo(() => {
    return [
      <MarketOverviewTab market={market} key={uuidv4()} />,
      <MarketActivityTab key={uuidv4()} isActive={true} />,
      <CommentTab key={uuidv4()} />,
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
      >
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
        <HStack gap={{ md: '12px', xxl: '40px' }} alignItems='flex-start'>
          <Box w={{ sm: 'full', md: 'calc(100vw - 642px)', xxl: '716px' }}>
            <Box px={isMobile ? '16px' : 0} mt={isMobile ? '16px' : 0}>
              <HStack w='full' flexWrap='wrap' gap='16px'>
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
                    <Link href={market?.creator.link || ''}>
                      <Text color='grey.500'>{market?.creator.name}</Text>
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
                    <HStack gap='16px'>
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
                          Volume {NumberUtil.convertWithDenomination(market.volumeFormatted, 6)}{' '}
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
                                6
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
              <PriceChartContainer priceHistories={mockPriceHistories} />
            </Box>
            <Text {...h2Medium} mt='24px'>
              Outcomes
            </Text>
            <VStack gap='8px' w='full' mb='24px' mt='8px'>
              {fetchMarketLoading ? (
                [...Array(3)].map((item) => (
                  <Box w='full' key={item}>
                    <Skeleton height={80} />
                  </Box>
                ))
              ) : (
                <Accordion
                  variant='paper'
                  gap='8px'
                  display='flex'
                  flexDirection='column'
                  allowToggle
                >
                  <GroupMarketsSection />
                </Accordion>
              )}
            </VStack>
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
          {isMobile && (
            <Box position='fixed' bottom='86px' w='calc(100% - 32px)' left='16px' zIndex={99999}>
              {mobileTradeButton}
            </Box>
          )}
        </HStack>
      </Box>
      <ConvertModal />
    </>
  )
}
