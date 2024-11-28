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
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import MarketPageOverviewTab from '@/components/common/markets/market-page-overview-tab'
import ShareMenu from '@/components/common/markets/share-menu'
import Paper from '@/components/common/paper'
import ProgressBar from '@/components/common/progress-bar'
import {
  LoadingForm,
  MarketPriceChart,
  SellForm,
} from '@/app/(markets)/markets/[address]/components'
import CommentTab from './comment-tab'
import { UniqueTraders } from './unique-traders'
import useMarketGroup from '@/hooks/use-market-group'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import ExpandIcon from '@/resources/icons/expand-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import OpinionIcon from '@/resources/icons/opinion-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import {
  ChangeEvent,
  ClickEvent,
  StrategyChangedMetadata,
  useAmplitude,
  useHistory,
  useTradingService,
} from '@/services'
import { useMarket } from '@/services/MarketsService'
import {
  controlsMedium,
  h2Bold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

const tokens = [
  'AAVE',
  'APE',
  'ATOM',
  'APT',
  'BRETT',
  'BTC',
  'DOGE',
  'EIGEN',
  'ENS',
  'ETH',
  'FLOKI',
  'RENDER',
  'SOL',
  'SUI',
  'ZRO',
  'ZK',
]

export default function MarketPage() {
  const [outcomeIndex, setOutcomeIndex] = useState(0)

  const scrollableBlockRef: LegacyRef<HTMLDivElement> | null = useRef(null)

  const {
    setMarket,
    onCloseMarketPage,
    market,
    strategy,
    setStrategy,
    status,
    marketGroup,
    setMarketGroup,
    refetchMarkets,
  } = useTradingService()

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { trackChanged, trackClicked } = useAmplitude()
  const { positions: allMarketsPositions } = useHistory()

  // Todo change creator name

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const marketAddress = useMemo(() => market?.address, [market])
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

  const { isOpen: isOpenSelectMarketMenu, onToggle: onToggleSelectMarketMenu } = useDisclosure()

  const isLumy = market?.category === 'Lumy'

  const isLivePriceSupportedMarket =
    isLumy &&
    [
      'Will AAVE',
      'Will APE',
      'Will ATOM',
      'Will APT',
      'Will BRETT',
      'Will BTC',
      'Will DOGE',
      'Will EIGEN',
      'Will ENS',
      'Will ETH',
      'Will FLOKI',
      'Will RENDER',
      'Will SOL',
      'Will SUI',
      'Will ZRO',
      'Will ZK',
    ].some((token) => market?.title.toLowerCase().includes(token.toLowerCase()))

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

  const tabs = [
    {
      title: 'Overview',
      icon: <PredictionsIcon width={16} height={16} />,
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

  const tabPanels = [
    <MarketPageOverviewTab key={uuidv4()} />,
    <MarketActivityTab key={uuidv4()} />,
    <CommentTab key={uuidv4()} />,
  ]

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
      marketAddress: market?.address as Address,
    })
  }

  const handleFullPageClicked = () => {
    trackClicked(ClickEvent.FullPageClicked, {
      marketAddress: market?.address,
      marketType: 'single',
      marketTags: market?.tags,
    })
  }

  const handleChartTabClicked = (event: ClickEvent) =>
    trackClicked(event, {
      marketAddress: market?.address,
      marketType: marketGroup ? 'group' : 'single',
      marketTags: market?.tags,
      platform: isMobile ? 'mobile' : 'desktop',
    })

  useEffect(() => {
    setStrategy('Buy')
  }, [])

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

  return (
    <Box
      bg='background.90'
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
      backdropFilter='blur(7.5px)'
    >
      {!isMobile && (
        <HStack w='full' justifyContent='space-between'>
          <HStack gap='16px'>
            <Button variant='grey' onClick={handleCloseMarketPageClicked}>
              <CloseIcon width={16} height={16} />
              Close
            </Button>
            <NextLink href={`/markets/${market?.address}`}>
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
        <HStack w='full' justifyContent='space-between' mb='4px'>
          <Text {...paragraphMedium} color='#0FC591'>
            Yes {market?.prices[0]}%
          </Text>
          <Text {...paragraphMedium} color='#FF3756'>
            No {market?.prices[1]}%
          </Text>
        </HStack>
        <ProgressBar variant='market' value={market ? market.prices[0] : 50} />
        <HStack gap='8px' justifyContent='space-between' mt='8px' flexWrap='wrap'>
          <HStack w={isMobile ? 'full' : 'unset'} gap='4px'>
            <HStack gap='4px'>
              <UniqueTraders color='grey.50' />
              <Text {...paragraphRegular} color='grey.500'>
                Volume
              </Text>
            </HStack>
            <Text {...paragraphRegular} color='grey.500'>
              {NumberUtil.convertWithDenomination(market?.volumeFormatted, 6)}{' '}
              {market?.collateralToken.symbol}
            </Text>
          </HStack>
          <HStack gap='4px' w={isMobile ? 'full' : 'unset'} justifyContent='unset'>
            <Box {...paragraphRegular}>💧 </Box>
            <Text {...paragraphRegular} color='grey.500'>
              Liquidity {NumberUtil.convertWithDenomination(market?.liquidityFormatted, 6)}{' '}
              {market?.collateralToken.symbol}
            </Text>
          </HStack>
        </HStack>
        <Divider my={isMobile ? '24px' : '16px'} />
      </Box>
      {market?.expired ? (
        <Paper h={'120px'}>
          {/*<Paper h={isMobile ? '348px' : '332px'}>*/}
          <VStack h='full' justifyContent='space-between' alignItems='flex-start'>
            <Text {...paragraphMedium} color='grey.800'>
              Market is closed
            </Text>
            <Button
              variant='white'
              onClick={() => {
                if (!isMobile) {
                  handleCloseMarketPageClicked()
                }
                router.push('/')
              }}
            >
              Explore Opened Markets
            </Button>
          </VStack>
        </Paper>
      ) : (
        <Paper bg='blue.500' borderRadius='8px' overflowX='hidden' p='8px'>
          <HStack
            w={'240px'}
            mx='auto'
            bg='rgba(255, 255, 255, 0.20)'
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
              bg={strategy === 'Buy' ? 'white' : 'unset'}
              color={strategy === 'Buy' ? 'black' : 'white'}
              _hover={{
                backgroundColor: strategy === 'Buy' ? 'white' : 'rgba(255, 255, 255, 0.30)',
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
              bg={strategy === 'Sell' ? 'white' : 'unset'}
              color={strategy === 'Sell' ? 'black' : 'white'}
              _hover={{
                backgroundColor: strategy === 'Sell' ? 'white' : 'rgba(255, 255, 255, 0.30)',
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
                          <VolumeIcon width={16} height={16} />
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
      )}
      {isLivePriceSupportedMarket ? (
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
      ) : (
        <MarketPriceChart />
      )}

      <Tabs position='relative' variant='common'>
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
