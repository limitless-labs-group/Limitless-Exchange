import {
  Button,
  HStack,
  Link,
  Text,
  Image as ChakraImage,
  Box,
  Divider,
  VStack,
  TabList,
  Tab,
  TabIndicator,
  TabPanels,
  TabPanel,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { LegacyRef, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Address } from 'viem'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import MarketPageOverviewTab from '@/components/common/markets/market-page-overview-tab'
import ShareMenu from '@/components/common/markets/share-menu'
import Paper from '@/components/common/paper'
import {
  LoadingForm,
  MarketPriceChart,
  SellForm,
} from '@/app/(markets)/markets/[address]/components'
import useMarketGroup from '@/hooks/use-market-group'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
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
  h2Medium,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

interface MarketSlidePageProps {
  market: Market
}

export default function MarketSlidePage({ market }: MarketSlidePageProps) {
  const [outcomeIndex, setOutcomeIndex] = useState(0)

  const scrollableBlockRef: LegacyRef<HTMLDivElement> | null = useRef(null)

  const {
    setMarket,
    onCloseMarketPage,
    strategy,
    setStrategy,
    status,
    marketGroup,
    setMarketGroup,
    refetchMarkets,
    market: selectedMarket,
    onOpenMarketPage,
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
        (position) => position.market.id.toLowerCase() === market?.address?.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const marketAddress = useMemo(() => selectedMarket?.address, [selectedMarket])
  const marketGroupSlug = useMemo(() => marketGroup?.slug, [marketGroup])

  const { data: updatedMarket } = useMarket(
    marketAddress as Address,
    selectedMarket?.address === market.address
  )
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

  const tabs = [
    {
      title: 'Overview',
      icon: <PredictionsIcon width={16} height={16} />,
    },
    {
      title: 'Activity',
      icon: <ActivityIcon width={16} height={16} />,
    },
  ]

  const tabPanels = [<MarketPageOverviewTab key={uuidv4()} />, <MarketActivityTab key={uuidv4()} />]

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
      bg='grey.50'
      borderTopRadius='8px'
      w='full'
      position='relative'
      height='calc(100dvh - 21px)'
      top='20px'
      right={0}
      overflowY='auto'
      p='12px'
      ref={scrollableBlockRef}
    >
      <HStack w='full' justifyContent='space-between' alignItems='flex-start' mt='10px'>
        <Text {...h2Medium}>{marketGroup?.title || market?.title}</Text>
        <ShareMenu />
      </HStack>
      <HStack w='full' justifyContent='space-between' mt='16px' mb='4px'>
        <HStack gap='16px'>
          <HStack gap='4px' color='grey.500'>
            <CalendarIcon width={16} height={16} />
            {market?.expirationTimestamp &&
            market.expirationTimestamp - new Date().getTime() < 1000 * 24 * 60 * 60 ? (
              <DailyMarketTimer
                deadline={market.expirationTimestamp}
                deadlineText={market.expirationDate}
                color='grey.500'
                showDays={false}
              />
            ) : (
              <Text {...paragraphMedium} color='grey.500'>
                {market?.expirationDate}
              </Text>
            )}
          </HStack>
          <HStack gap='4px' flexWrap='wrap'>
            <ChakraImage
              width={3.5}
              height={3.5}
              src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
              alt='creator'
              borderRadius={'2px'}
            />
            <Link href={market?.creator.link} variant='textLinkSecondary'>
              {market?.creator.name}
            </Link>
          </HStack>
        </HStack>
        <HStack gap={1} color={defaultColors.main}>
          <Text {...paragraphMedium} color={defaultColors.main}>
            {market?.prices[0]}%
          </Text>
          <Box w='16px' h='16px' display='flex' alignItems='center' justifyContent='center'>
            <Box
              h='100%'
              w='100%'
              borderRadius='100%'
              bg={`conic-gradient(${defaultColors.main} ${market?.prices[0]}% 10%, ${defaultColors.chartBg} ${market?.prices[0]}% 100%)`}
            />
          </Box>
        </HStack>
      </HStack>
      <Divider my='8px' />
      <HStack w='full' mb='32px' mt='24px'>
        <VStack alignItems='center' flex={1} gap={0}>
          <HStack color='grey.400' gap='4px'>
            <VolumeIcon width={16} height={16} />
            <Text {...paragraphMedium} color='grey.400'>
              Volume
            </Text>
          </HStack>
          <Text {...paragraphMedium} color='grey.500'>{`${NumberUtil.convertWithDenomination(
            market?.volumeFormatted,
            6
          )} ${market?.collateralToken.symbol}`}</Text>
        </VStack>
        <VStack alignItems='center' flex={1} gap={0}>
          <HStack color='grey.400' gap='4px'>
            <LiquidityIcon width={16} height={16} />
            <Text {...paragraphMedium} color='grey.400'>
              Liquidity
            </Text>
          </HStack>
          <Text {...paragraphMedium} color='grey.500'>{`${NumberUtil.convertWithDenomination(
            market?.liquidityFormatted,
            6
          )} ${market?.collateralToken.symbol}`}</Text>
        </VStack>
      </HStack>
      <Paper
        bg='blue.500'
        borderRadius='8px'
        overflowX='hidden'
        p='8px'
        // onClick={handleMarketChosen}
      >
        <HStack
          w={'240px'}
          mx='auto'
          bg='rgba(255, 255, 255, 0.20)'
          borderRadius='8px'
          py='2px'
          px='4px'
          mb='16px'
        >
          <Button
            h='28px'
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
            h='28px'
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
            <Box mx='16px'>
              <Button
                variant='transparentLight'
                w='full'
                justifyContent='space-between'
                mb={isOpenSelectMarketMenu ? '8px' : '24px'}
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
              <VStack gap='16px' mb='16px' mx='16px'>
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
                    <HStack gap='8px' flexDirection='column' w='full'>
                      <HStack w='full' justifyContent='space-between' color='white'>
                        <LiquidityIcon width={16} height={16} />
                        <Text {...paragraphRegular} color='white'>
                          {NumberUtil.formatThousands(market.liquidityFormatted, 6)}{' '}
                          {market.collateralToken.symbol}
                        </Text>
                      </HStack>
                      <HStack w='full' justifyContent='space-between' color='white'>
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
            slideMarket={market}
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
      {market && <MarketPriceChart />}
      <Tabs position='relative' variant='common'>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.title}>
              <HStack gap='8px' w='fit-content'>
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
