import {
  Button,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
import React, { useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { Address, zeroAddress } from 'viem'
import MarketActivityTab from '@/components/common/markets/activity-tab'
import DailyMarketTimer from '@/components/common/markets/market-cards/daily-market-timer'
import MarketPageBuyForm from '@/components/common/markets/market-page-buy-form'
import MarketPageOverviewTab from '@/components/common/markets/market-page-overview-tab'
import Paper from '@/components/common/paper'
import {
  LoadingForm,
  MarketPriceChart,
  SellForm,
} from '@/app/(markets)/markets/[address]/components'
import { defaultChain } from '@/constants'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import CopyIcon from '@/resources/icons/link-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import ShareIcon from '@/resources/icons/share-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import {
  ChangeEvent,
  ClickEvent,
  createMarketShareUrls,
  ShareClickedMetadata,
  StrategyChangedMetadata,
  useAmplitude,
  useHistory,
  useTradingService,
} from '@/services'
import { useWinningIndex } from '@/services/MarketsService'
import {
  controlsMedium,
  h1Regular,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

const defaultColors = {
  main: 'var(--chakra-colors-grey-800)',
  secondary: 'var(--chakra-colors-grey-500)',
  chartBg: 'var(--chakra-colors-grey-300)',
}

export default function MarketPage() {
  const [isShareMenuOpen, setShareMenuOpen] = useState(false)
  const [outcomeIndex, setOutcomeIndex] = useState(0)
  const {
    setMarket,
    onCloseMarketPage,
    market,
    strategy,
    setStrategy,
    status,
    marketGroup,
    setMarketGroup,
  } = useTradingService()

  const { trackChanged, trackClicked } = useAmplitude()
  const { positions: allMarketsPositions } = useHistory()
  const { data: winningIndex } = useWinningIndex(market?.address || '')
  const marketURI = marketGroup
    ? `${process.env.NEXT_PUBLIC_FRAME_URL}/market-group/${marketGroup.slug}`
    : `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${market?.address}`
  const resolved = winningIndex === 0 || winningIndex === 1
  // Todo change creator name
  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices, 'asd')

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

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

  return (
    <Paper
      bg='grey.50'
      borderTopLeftRadius='8px'
      borderBottomLeftRadius='8px'
      borderTopRadius={0}
      borderBottomRightRadius={0}
      w={isMobile ? 'full' : '488px'}
      position='fixed'
      height={isMobile ? 'calc(100dvh - 21px)' : 'calc(100vh - 21px)'}
      top='20px'
      right={0}
      overflowY='auto'
    >
      {!isMobile && (
        <HStack w='full' justifyContent='space-between'>
          <Button
            variant='grey'
            onClick={() => {
              setMarket(null)
              onCloseMarketPage()
              setMarketGroup(null)
              // trackClicked(ClickEvent.BackClicked, {
              //   address: market?.address,
              // })
              // handleBackClicked()
            }}
          >
            <CloseIcon width={16} height={16} />
            Close
          </Button>
          <Menu isOpen={isShareMenuOpen} onClose={() => setShareMenuOpen(false)}>
            <MenuButton
              onClick={() => {
                // trackClicked(ClickEvent.ShareMenuClicked, {
                //   address: market?.address,
                //   marketType: 'single',
                // })
                setShareMenuOpen(true)
              }}
            >
              <HStack gap='4px'>
                <ShareIcon width={16} height={16} />
                <Text {...paragraphMedium}>Share</Text>
              </HStack>
            </MenuButton>
            <MenuList borderRadius='2px' w={isMobile ? '160px' : '122px'} zIndex={2}>
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
                <HStack gap='4px' w='full'>
                  <WarpcastIcon width={16} height={16} />
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
                <HStack gap='4px' w='full'>
                  <TwitterIcon width={16} height={16} />
                  <Text {...paragraphMedium}>On X</Text>
                </HStack>
              </MenuItem>
              <MenuItem>
                <CopyToClipboard text={marketURI}>
                  <HStack gap='4px' w='full'>
                    <CopyIcon width={16} height={16} />
                    <Text {...paragraphMedium}>Copy Link</Text>
                  </HStack>
                </CopyToClipboard>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}
      <Text mt='10px' {...h1Regular}>
        {marketGroup?.title || market?.title}
      </Text>

      <HStack w='full' justifyContent='space-between' mt={isMobile ? '16px' : '10px'} mb='4px'>
        <HStack gap={isMobile ? '16px' : '24px'}>
          <HStack gap='4px' color='grey.500'>
            <CalendarIcon width={16} height={16} />
            {market?.expirationTimestamp &&
            market.expirationTimestamp - new Date().getTime() < 1000 * 24 * 60 * 60 ? (
              <DailyMarketTimer
                deadline={market.expirationTimestamp}
                color='grey.500'
                showDays={false}
              />
            ) : (
              <Text {...paragraphMedium} color='grey.500'>
                {market?.expirationDate}
              </Text>
            )}
          </HStack>
          <HStack gap='8px' flexWrap='wrap'>
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
      <Divider my='8px' color='grey.300' />
      <HStack w='full' mb={isMobile ? '32px' : '24px'} mt={isMobile ? '24px' : 0}>
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
      <Paper bg='blue.500' borderRadius='8px' overflowX='hidden' p='8px'>
        <HStack
          w={'240px'}
          mx='auto'
          bg='rgba(255, 255, 255, 0.20)'
          borderRadius='2px'
          py='2px'
          px={isMobile ? '4px' : '2px'}
          mb={isMobile ? '16px' : '24px'}
        >
          <Button
            h={isMobile ? '28px' : '20px'}
            flex='1'
            py='2px'
            borderRadius='2px'
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
            borderRadius='2px'
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
          <MarketPageBuyForm setOutcomeIndex={setOutcomeIndex} marketList={marketGroup?.markets} />
        )}
        {strategy === 'Sell' ? (
          status === 'Loading' ? (
            <LoadingForm outcomeIndex={outcomeIndex} />
          ) : (
            <SellForm setOutcomeIndex={setOutcomeIndex} />
          )
        ) : null}
      </Paper>
      {market && (
        <MarketPriceChart
          winningIndex={winningIndex}
          resolved={resolved}
          outcomeTokensPercent={market.prices}
        />
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
    </Paper>
  )
}
