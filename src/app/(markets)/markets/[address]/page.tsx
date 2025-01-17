'use client'

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
  useDisclosure,
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
import { MarketAssetPriceChart } from '@/components/common/markets/market-asset-price-chart'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import OpenInterestTooltip from '@/components/common/markets/open-interest-tooltip'
import ShareMenu from '@/components/common/markets/share-menu'
import { UniqueTraders } from '@/components/common/markets/unique-traders'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import Skeleton from '@/components/common/skeleton'
import MarketOverviewTab from '@/app/(markets)/markets/[address]/components/overview-tab'
import PortfolioTab from '@/app/(markets)/markets/[address]/components/portfolio-tab'
import {
  LoadingForm,
  MarketPriceChart,
  MarketTradingForm,
  MobileTradeButton,
  SellForm,
} from './components'
import { MainLayout } from '@/components'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import ResolutionIcon from '@/resources/icons/resolution-icon.svg'
import {
  ChangeEvent,
  ClickEvent,
  OpenEvent,
  StrategyChangedMetadata,
  useAmplitude,
  useHistory,
  useTradingService,
} from '@/services'
import { useMarket } from '@/services/MarketsService'
import {
  controlsMedium,
  h1Regular,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

const tokens = [
  'AAVE',
  'AERO',
  'ALGO',
  'APE',
  'ATOM',
  'APT',
  'AVAX',
  'DOT',
  'EIGEN',
  'ENS',
  'FTM',
  'HBAR',
  'ICP',
  'INJ',
  'JUP',
  'LDO',
  'LINK',
  'NEAR',
  'ONDO',
  'OP',
  'PYTH',
  'RENDER',
  'SUI',
  'WLD',
  'ZK',
  'ZRO',
]

const MarketPage = ({ params }: { params: { address: Address } }) => {
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  /**
   * ANALYTICS
   */
  const { trackClicked, trackOpened, trackChanged } = useAmplitude()
  const router = useRouter()
  const { data: market, isLoading: fetchMarketLoading } = useMarket(params.address)
  const { setMarket, resetQuotes, strategy, setStrategy, marketGroup, status } = useTradingService()
  const { isOpen: isOpenSelectMarketMenu, onToggle: onToggleSelectMarketMenu } = useDisclosure()

  const { positions: allMarketsPositions } = useHistory()
  const isLumy = market?.category === 'Lumy'

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const marketActionForm = useMemo(() => {
    if (fetchMarketLoading) {
      return (
        <Box w='312px'>
          <Skeleton height={481} />
        </Box>
      )
    }
    if (market) {
      return market?.expired ? (
        <Paper h={'120px'}>
          {/*<Paper h={isMobile ? '348px' : '332px'}>*/}
          <VStack h='full' justifyContent='space-between' alignItems='flex-start'>
            <Text {...paragraphMedium} color='grey.800'>
              Market is closed
            </Text>
            <Button
              variant='white'
              onClick={() => {
                router.push('/')
              }}
            >
              Explore Opened Markets
            </Button>
          </VStack>
        </Paper>
      ) : (
        <Paper
          bg={'var(--chakra-colors-grey-100)'}
          borderRadius='8px'
          overflowX='hidden'
          p='8px'
          w='424px'
        >
          <HStack
            w={'240px'}
            mx='auto'
            bg='grey.200'
            borderRadius='8px'
            py='2px'
            px={isMobile ? '4px' : '2px'}
            mb={isMobile ? '16px' : '24px'}
          >
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              py='2px'
              borderRadius='8px'
              bg={strategy === 'Buy' ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: strategy === 'Buy' ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              onClick={() => {
                trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                  type: 'Buy selected',
                  marketAddress: market?.address as Address,
                })
                setStrategy('Buy')
              }}
            >
              <Text {...controlsMedium} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
                Buy
              </Text>
            </Button>
            <Button
              h={isMobile ? '28px' : '20px'}
              flex='1'
              borderRadius='8px'
              py='2px'
              bg={strategy === 'Sell' ? 'grey.50' : 'unset'}
              color='grey.800'
              _hover={{
                backgroundColor: strategy === 'Sell' ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
              }}
              _disabled={{
                opacity: '50%',
                pointerEvents: 'none',
              }}
              onClick={() => {
                trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
                  type: 'Sell selected',
                  marketAddress: market?.address as Address,
                })
                setStrategy('Sell')
              }}
              isDisabled={!positions?.length}
            >
              <Text {...controlsMedium} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
                Sell
              </Text>
            </Button>
          </HStack>
          {marketGroup?.markets.length && (
            <>
              <Box mx={isMobile ? '16px' : 0}>
                <Button
                  variant='transparentLight'
                  w='full'
                  justifyContent='space-between'
                  mb={isOpenSelectMarketMenu ? '8px' : isMobile ? '24px' : '32px'}
                  onClick={onToggleSelectMarketMenu}
                  rightIcon={
                    <Box
                      transform={`rotate(${isOpenSelectMarketMenu ? '180deg' : 0})`}
                      transition='0.5s'
                      color='white'
                    >
                      <ChevronDownIcon width='16px' height='16px' />
                    </Box>
                  }
                >
                  <HStack gap='8px' color='white'>
                    <PredictionsIcon />
                    <Text {...paragraphMedium} color='white'>
                      {market?.title}
                    </Text>
                  </HStack>
                </Button>
              </Box>
              {isOpenSelectMarketMenu && (
                <VStack
                  gap={isMobile ? '16px' : '8px'}
                  mb={isMobile ? '16px' : '8px'}
                  mx={isMobile ? '16px' : 0}
                >
                  {marketGroup?.markets.map((market) => (
                    <Button
                      key={market.address}
                      onClick={() => {
                        setMarket(market)
                        onToggleSelectMarketMenu()
                      }}
                      flexDirection='column'
                      variant='transparentLight'
                      w='full'
                    >
                      <HStack mb='8px' w='full'>
                        <HStack justifyContent='space-between' w='full' alignItems='flex-start'>
                          <Text {...paragraphMedium} color='white'>
                            {market.title}
                          </Text>
                          <HStack gap='4px'>
                            <Text {...paragraphMedium} color='white'>
                              {market.prices[0]}%
                            </Text>
                            <Box
                              w='16px'
                              h='16px'
                              display='flex'
                              alignItems='center'
                              justifyContent='center'
                            >
                              <Box
                                h='100%'
                                w='100%'
                                borderRadius='100%'
                                bg={`conic-gradient(white 0% ${
                                  market.prices[0]
                                }%, var(--chakra-colors-transparent-300) ${
                                  market.prices[0] < 1 ? 1 : market.prices[0]
                                }% 100%)`}
                              />
                            </Box>
                          </HStack>
                        </HStack>
                      </HStack>
                      <HStack
                        gap={isMobile ? '8px' : '16px'}
                        flexDirection={isMobile ? 'column' : 'row'}
                        w='full'
                      >
                        <HStack
                          w={isMobile ? '100%' : 'unset'}
                          justifyContent={isMobile ? 'space-between' : 'unset'}
                          color='white'
                        >
                          <LiquidityIcon width={16} height={16} />
                          <Text {...paragraphRegular} color='white'>
                            {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
                            {market.collateralToken.symbol}
                          </Text>
                        </HStack>
                        <HStack
                          w={isMobile ? '100%' : 'unset'}
                          justifyContent={isMobile ? 'space-between' : 'unset'}
                          color='white'
                        >
                          <Text {...paragraphRegular} color='white'>
                            {NumberUtil.formatThousands(market.volumeFormatted, 6)}{' '}
                            {market.collateralToken.symbol}
                          </Text>
                        </HStack>
                      </HStack>
                    </Button>
                  ))}
                </VStack>
              )}
            </>
          )}
          {strategy === 'Buy' && (
            <MarketPageBuyForm
              setOutcomeIndex={setOutcomeIndex}
              marketList={marketGroup?.markets}
            />
          )}
          {strategy === 'Sell' ? (
            status === 'Loading' ? (
              <LoadingForm outcomeIndex={outcomeIndex} />
            ) : (
              <SellForm setOutcomeIndex={setOutcomeIndex} />
            )
          ) : null}
        </Paper>
      )
    }
    return null
  }, [
    fetchMarketLoading,
    market,
    strategy,
    positions?.length,
    marketGroup?.markets,
    isOpenSelectMarketMenu,
    status,
    outcomeIndex,
    router,
  ])

  const isLivePriceSupportedMarket =
    isLumy &&
    tokens
      .map((token) => `Will ${token}`)
      .some((token) => market?.title.toLowerCase().includes(token.toLowerCase()))

  const chartTabs = [
    {
      title: 'Predictions',
      icon: <PredictionsIcon width={16} height={16} />,
      analyticEvent: ClickEvent.PredictionChartOpened,
    },
    {
      title: 'Assets price',
      icon: <CandlestickIcon width={16} height={16} />,
      analyticEvent: ClickEvent.AssetPriceChartOpened,
    },
  ]

  const handleChartTabClicked = (event: ClickEvent) =>
    trackClicked(event, {
      marketAddress: market?.address,
      marketType: marketGroup ? 'group' : 'single',
      marketTags: market?.tags,
      platform: isMobile ? 'mobile' : 'desktop',
    })

  const chartsTabPanels = useMemo(
    () => [
      <MarketPriceChart key={uuidv4()} />,
      <MarketAssetPriceChart
        key={uuidv4()}
        id={tokens.filter((token) => market?.title.includes(token))[0]}
      />,
    ],
    [market?.title]
  )

  const marketChartContent = useMemo(() => {
    if (isLivePriceSupportedMarket) {
      return (
        <Tabs position='relative' variant='common' mt='20px'>
          <TabList>
            {chartTabs.map((tab) => (
              <Tab key={tab.title} onClick={() => handleChartTabClicked(tab.analyticEvent)}>
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
            {chartsTabPanels.map((panel, index) => (
              <TabPanel key={index}>{panel}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )
    }
    return <MarketPriceChart />
  }, [])

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
      <MarketActivityTab key={uuidv4()} isActive />,
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
          <HStack
            gap='40px'
            w={isMobile ? 'full' : 'unset'}
            alignItems='flex-start'
            mb={isMobile ? '84px' : 0}
          >
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
                  <ShareMenu />
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
                  marketChartContent
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
            {!isMobile && marketActionForm}
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
