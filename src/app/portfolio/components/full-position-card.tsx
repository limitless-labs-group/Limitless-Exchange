import {
  Box,
  Divider,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React, { SyntheticEvent, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import MobileDrawer from '@/components/common/drawer'
import ClaimButton from '@/components/common/markets/claim-button'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import { SpeedometerProgress } from '@/components/common/markets/market-cards/speedometer-progress'
import MarketPage from '@/components/common/markets/market-page'
import FullOrdersTab from '@/app/portfolio/components/full-orders-tab'
import FullPositionsTab from '@/app/portfolio/components/full-positions-tab'
import RewardsSection from '@/app/portfolio/components/rewards-section'
import CandlestickIcon from '@/resources/icons/candlestick-icon.svg'
import GemWhiteIcon from '@/resources/icons/gem-white-icon.svg'
import PieChartIcon from '@/resources/icons/pie-chart-icon.svg'
import {
  ClickEvent,
  ClobPositionWithType,
  useAmplitude,
  useBalanceQuery,
  useTradingService,
} from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useMarket } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { PortfolioTab } from '@/types/portfolio'
import { NumberUtil } from '@/utils'

interface FullPositionCardProps {
  position: ClobPositionWithType
  type: PortfolioTab
}

export default function FullPositionCard({ position, type }: FullPositionCardProps) {
  const [activeTab, setActiveTab] = useState(0)
  const date = new Date(position.market.deadline)
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { onOpenMarketPage, setMarket } = useTradingService()
  const marketClosed = position.market.status === MarketStatus.RESOLVED
  const { trackClicked } = useAmplitude()
  const { data: oneMarket, refetch: refetchMarket } = useMarket(
    position.market.negRiskRequestId ? position.market.group?.slug : position.market.slug,
    false,
    false
  )

  const queryClient = useQueryClient()
  const privateClient = useAxiosPrivateClient()

  const nonEarningCardBorder = marketClosed ? 'green.500' : 'grey.100'

  const totalRewards = position.rewards.epochs.reduce((acc, epoch) => {
    const rewardFormatted = formatUnits(
      BigInt(epoch.totalRewards),
      position.market.collateralToken.decimals
    )
    return new BigNumber(rewardFormatted).plus(acc).toNumber()
  }, 0)

  const totalLimitOrders = formatUnits(
    BigInt(position.orders.totalCollateralLocked),
    position.market.collateralToken.decimals
  )

  const totalLimitOrdersColor = () => {
    const collateralBalance = balanceOfSmartWallet?.find(
      (balanceItem) => balanceItem.symbol === position.market.collateralToken.symbol
    )
    if (!collateralBalance) {
      return 'grey.500'
    }
    if (+collateralBalance.formatted < +totalLimitOrders) {
      return 'red.500'
    }
    const diiferenceInPercent = new BigNumber(totalLimitOrders)
      .dividedBy(collateralBalance.formatted)
      .decimalPlaces(1)
      .toNumber()
    if (diiferenceInPercent >= 0.85) {
      return 'yellow.500'
    }
    return 'grey.500'
  }

  const getAmountToClaim = () => {
    const winPosition =
      position.market.winningOutcomeIndex === 1
        ? position.tokensBalance.no
        : position.tokensBalance.yes
    return formatUnits(BigInt(winPosition), position.market.collateralToken.decimals)
  }

  const getPnL = () => {
    const winSide =
      position.market.winningOutcomeIndex === 1 ? position.positions.no : position.positions.yes
    const lossSide =
      position.market.winningOutcomeIndex === 0 ? position.positions.no : position.positions.yes
    const winPosition =
      position.market.winningOutcomeIndex === 1
        ? position.tokensBalance.no
        : position.tokensBalance.yes
    const totalCost = new BigNumber(winSide.cost).plus(lossSide.cost).toString()
    const pnl = new BigNumber(winPosition).minus(totalCost).toNumber()
    const formatted = formatUnits(BigInt(pnl), position.market.collateralToken.decimals)
    return NumberUtil.convertWithDenomination(formatted, 2)
  }

  const formatted = date
    .toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(',', '')

  const yesPrice = new BigNumber(position.latestTrade?.latestYesPrice || 0.5)
    .multipliedBy(100)
    .decimalPlaces(1)
    .toNumber()

  const cancelAllOrdersMutation = useMutation({
    mutationKey: ['cancel-all-orders', position.market.slug],
    mutationFn: async () => {
      trackClicked(ClickEvent.CancelAllOrdersClicked, {
        source: 'Portfolio Page',
        value: '',
        marketAddress: position.market.address,
        marketType: position.market.marketType,
        tradeType: position.market.tradeType,
      })
      await privateClient.delete(`/orders/all/${position.market.slug}`)
    },
  })

  const onResetMutation = async () => {
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: ['user-orders', position.market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['market-shares', position.market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['order-book', position.market?.slug],
      }),
      queryClient.refetchQueries({
        queryKey: ['positions'],
      }),
    ])
    setActiveTab(0)
    cancelAllOrdersMutation.reset()
  }

  const showOrders = !marketClosed && Boolean(position.orders.liveOrders.length)

  const handleTabClicked = (e: SyntheticEvent, tab: string) => {
    e.stopPropagation()
    trackClicked(ClickEvent.ClobPositionTabClicked, {
      value: tab,
      source: 'portfolio clob position card',
      marketAddress: position.market.slug,
      marketType: position.market.marketType,
      tradeType: position.market.tradeType,
    })
  }

  const getTabs = () => {
    if (type === 'positions-only') {
      return [
        {
          title: 'Positions',
          show: true,
        },
      ]
    }
    if (type === 'orders-only') {
      return [
        {
          title: 'Open Orders',
          show: showOrders,
        },
      ]
    }
    return [
      {
        title: 'Positions',
        show: true,
      },
      {
        title: 'Open Orders',
        show: showOrders,
      },
    ]
  }

  const tabs = getTabs()

  const getTabList = () => {
    if (type === 'positions-only') {
      return [
        <FullPositionsTab
          key='full-positions'
          position={position.positions}
          contracts={position.tokensBalance}
          decimals={position.market.collateralToken.decimals}
          symbol={position.market.collateralToken.symbol}
          marketClosed={marketClosed}
          winSide={position.market.winningOutcomeIndex}
        />,
      ]
    }
    if (type === 'orders-only') {
      return [
        <FullOrdersTab
          key='full-orders-tab'
          orders={position.orders.liveOrders}
          yesPositionId={position.market.yesPositionId as string}
          decimals={position.market.collateralToken.decimals}
          symbol={position.market.collateralToken.symbol}
        />,
      ]
    }
    return [
      <FullPositionsTab
        key='full-positions'
        position={position.positions}
        contracts={position.tokensBalance}
        decimals={position.market.collateralToken.decimals}
        symbol={position.market.collateralToken.symbol}
        marketClosed={marketClosed}
        winSide={position.market.winningOutcomeIndex}
      />,
      <FullOrdersTab
        key='full-orders-tab'
        orders={position.orders.liveOrders}
        yesPositionId={position.market.yesPositionId as string}
        decimals={position.market.collateralToken.decimals}
        symbol={position.market.collateralToken.symbol}
      />,
    ]
  }

  const tabList = getTabList()

  const handleOpenMarketPage = async () => {
    if (!oneMarket) {
      const { data: fetchedMarket } = await refetchMarket()
      if (fetchedMarket) {
        onOpenMarketPage(fetchedMarket)
        if (fetchedMarket.negRiskMarketId) {
          const targetMarket = fetchedMarket?.markets?.find(
            (market) => market.slug === position.market.slug
          )
          setMarket(targetMarket || null)
        }
        trackClicked(ClickEvent.PortfolioMarketClicked, {
          marketCategory: fetchedMarket.categories,
          marketAddress: fetchedMarket.slug,
          marketType: position.market.negRiskRequestId ? 'group' : 'single',
          marketTags: fetchedMarket.tags,
          type: 'Portolio',
        })
      }
    } else {
      onOpenMarketPage(oneMarket)
      if (oneMarket.negRiskRequestId) {
        const targetMarket = oneMarket.markets?.find(
          (market) => market.slug === position.market.slug
        )
        setMarket(targetMarket || null)
      }
      trackClicked(ClickEvent.PortfolioMarketClicked, {
        marketCategory: oneMarket.categories,
        marketAddress: oneMarket.slug,
        marketType: position.market.negRiskRequestId ? 'group' : 'single',
        marketTags: oneMarket.tags,
        type: 'Portolio',
      })
    }
  }

  const amountsToNegriskClaim = useMemo(() => {
    if (!position.market.negRiskRequestId) {
      return
    }
    const yesTokensToClaim =
      position.market.winningOutcomeIndex === 0 ? BigInt(position.tokensBalance.yes) : 0n
    const noTokensToClaim =
      position.market.winningOutcomeIndex === 1 ? BigInt(position.tokensBalance.no) : 0n
    return [yesTokensToClaim, noTokensToClaim]
  }, [
    position.market.negRiskRequestId,
    position.market.winningOutcomeIndex,
    position.tokensBalance.no,
    position.tokensBalance.yes,
  ])

  const content = (
    <Box
      p='16px'
      w='full'
      border='2px solid'
      borderColor={position.rewards.isEarning ? 'blue.500' : nonEarningCardBorder}
      borderRadius='12px'
      bg={marketClosed ? 'green.500' : 'unset'}
      cursor='pointer'
      onClick={handleOpenMarketPage}
    >
      <HStack
        gap='24px'
        w='full'
        justifyContent='space-between'
        alignItems={marketClosed ? 'flex-start' : 'center'}
        flexWrap='wrap'
      >
        <Box w={isMobile ? 'full' : 'unset'}>
          <HStack w='full' justifyContent='space-between' mb='16px'>
            <Text
              {...paragraphRegular}
              textAlign='left'
              color={marketClosed ? 'white' : 'grey.800'}
            >
              {position.market.title}
            </Text>
            {isMobile && !marketClosed && (
              <HStack minW='120px' justifyContent='flex-end'>
                <SpeedometerProgress value={yesPrice} size='medium' />
              </HStack>
            )}
          </HStack>
          {isMobile && marketClosed && (
            <Box mb='16px'>
              <ClaimButton
                conditionId={position.market.conditionId as Address}
                collateralAddress={position.market.collateralToken.address}
                marketAddress={
                  position.market.negRiskRequestId
                    ? (process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address)
                    : (process.env.NEXT_PUBLIC_CTF_CONTRACT as Address)
                }
                marketType={position.market.tradeType}
                amounts={amountsToNegriskClaim}
                amountToClaim={getAmountToClaim()}
                negRiskRequestId={position.market.negRiskRequestId}
                symbol={position.market.collateralToken.symbol}
              />
            </Box>
          )}
        </Box>
        {!isMobile && (
          <>
            {!marketClosed ? (
              <SpeedometerProgress value={yesPrice} size='medium' />
            ) : (
              <ClaimButton
                conditionId={position.market.conditionId as Address}
                collateralAddress={position.market.collateralToken.address}
                marketAddress={
                  position.market.negRiskRequestId
                    ? (process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address)
                    : (process.env.NEXT_PUBLIC_CTF_CONTRACT as Address)
                }
                negRiskRequestId={position.market.negRiskRequestId}
                amounts={amountsToNegriskClaim}
                marketType={position.market.tradeType}
                amountToClaim={getAmountToClaim()}
                symbol={position.market.collateralToken.symbol}
              />
            )}
          </>
        )}
      </HStack>
      <HStack
        gap={isMobile ? '16px' : '24px'}
        columnGap='8px'
        flexWrap='wrap'
        justifyContent='space-between'
      >
        <HStack gap='8px'>
          <MarketCountdown
            deadline={new Date(position.market.deadline).getTime()}
            deadlineText={formatted}
            showDays={false}
            hideText={isMobile}
            color={marketClosed ? 'whiteAlpha.70' : 'grey.500'}
            ended={marketClosed}
          />
          {marketClosed ? (
            <HStack gap='4px'>
              <GemWhiteIcon />
              <Text {...paragraphRegular} color='whiteAlpha.70'>
                Total Rewards Earned
              </Text>
              <Text {...paragraphRegular} color='whiteAlpha.70'>
                {NumberUtil.convertWithDenomination(totalRewards, 2)}{' '}
                {position.market.collateralToken.symbol}
              </Text>
            </HStack>
          ) : (
            <HStack gap='4px' color='grey.500'>
              <CandlestickIcon width={16} height={16} />
              <Text {...paragraphRegular} color='grey.500'>
                Total Limit orders
              </Text>
              <Text {...paragraphMedium} color={totalLimitOrdersColor()}>
                {NumberUtil.toFixed(totalLimitOrders, 2)} USD
              </Text>
            </HStack>
          )}
        </HStack>
        {marketClosed ? (
          <HStack gap='4px' color='whiteAlpha.70'>
            <PieChartIcon width={16} height={16} />
            <Text {...paragraphRegular} color='whiteAlpha.70'>
              P&L
            </Text>
            <Text {...paragraphRegular} color='whiteAlpha.70'>
              {getPnL()} {position.market.collateralToken.symbol}
            </Text>
          </HStack>
        ) : (
          <RewardsSection position={position} />
        )}
      </HStack>
      <Divider my='16px' h='2px' variant={marketClosed ? 'transparent' : undefined} />
      <Tabs position='relative' variant='transparent' index={activeTab} onChange={setActiveTab}>
        <HStack w='full' justifyContent='space-between'>
          <TabList>
            {tabs.map((tab) => {
              return tab.show ? (
                <Tab
                  {...(marketClosed ? { color: 'white !important' } : {})}
                  key={tab.title}
                  onClick={(e) => handleTabClicked(e, tab.title)}
                >
                  {tab.title}
                </Tab>
              ) : null
            })}
          </TabList>
          {showOrders && activeTab === 1 && (
            <ButtonWithStates
              onReset={onResetMutation}
              status={cancelAllOrdersMutation.status}
              onClick={(e) => {
                e.stopPropagation()
                cancelAllOrdersMutation.mutateAsync()
              }}
              variant='outlined'
              w='82px'
            >
              Cancel all
            </ButtonWithStates>
          )}
        </HStack>
        <TabPanels>
          {tabList.map((panel, index) => (
            <TabPanel key={index}>{panel}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  )

  return isMobile ? (
    <MobileDrawer
      trigger={content}
      variant='black'
      onClose={() => {
        setMarket(null)
      }}
      id={position.market.slug}
    >
      <MarketPage />
    </MobileDrawer>
  ) : (
    content
  )
}
