import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { isNumber } from '@chakra-ui/utils'
import BigNumber from 'bignumber.js'
import React, { SyntheticEvent, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import MobileDrawer from '@/components/common/drawer'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import MarketPageNergiskMobile from '@/components/common/markets/market-page-nergisk-mobile'
import RewardTooltipSmall from '@/app/(markets)/markets/[address]/components/clob/reward-tooltip-small'
import { useMarketOrders } from '@/hooks/use-market-orders'
import ArrowLeftIcon from '@/resources/icons/arrow-left-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ClickEvent, QuickBetClickedMetadata, useAmplitude, useTradingService } from '@/services'
import { h3Medium, headline, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketOrderType } from '@/types'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface GroupMarketsSectionMobileProps {
  market: Market
}

export default function GroupMarketsSectionMobile({ market }: GroupMarketsSectionMobileProps) {
  const {
    setMarket,
    market: selectedMarket,
    setClobOutcome,
    clobOutcome,
    groupMarket,
    strategy,
  } = useTradingService()
  const { orderType } = useClobWidget()
  const { trackClicked } = useAmplitude()

  const { data: userOrders } = useMarketOrders(market?.slug)

  const handleOutcomeClicked = (e: SyntheticEvent, outcome: number) => {
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Market page from outcomes section',
      value: outcome ? 'small no button' : 'small yes button',
    })
    setClobOutcome(outcome)
    trackClicked<QuickBetClickedMetadata>(ClickEvent.QuickBetClicked, {
      source: 'Market page from outcomes section',
      value: outcome ? 'small no button' : 'small yes button',
    })
    if (market.slug === selectedMarket?.slug) {
      e.stopPropagation()
    }
    if (market.slug !== selectedMarket?.slug) {
      setMarket(market)
    }
  }

  const calculateTotalContracts = (orders: ClobPosition[]) => {
    return orders.reduce((a, acc) => {
      return new BigNumber(a)
        .plus(new BigNumber(formatUnits(BigInt(acc.originalSize), market.collateralToken.decimals)))
        .toNumber()
    }, 0)
  }

  const onOpenMarketPage = (index: number) => {
    if (groupMarket?.markets) {
      const marketToSet = groupMarket.markets[index || 0] || null
      setMarket(marketToSet)
    }
  }

  const calculateAveragePrice = (orders: ClobPosition[]) => {
    const totalSharesMulAmount = orders.reduce((a, acc) => {
      const priceFormatted = new BigNumber(acc.price).multipliedBy(100).toFixed(1)
      const sharesFormatted = formatUnits(BigInt(acc.originalSize), market.collateralToken.decimals)
      return new BigNumber(a)
        .plus(new BigNumber(priceFormatted).multipliedBy(sharesFormatted))
        .toNumber()
    }, 0)
    const totalShares = calculateTotalContracts(orders)
    return new BigNumber(totalSharesMulAmount).dividedBy(totalShares).decimalPlaces(1).toFixed()
  }

  const userOrdersWithOutcomes = useMemo(() => {
    if (!userOrders?.length) {
      return null
    }
    const yesOrders = userOrders.filter((order) => order.token === market.tokens.yes)
    const noOrders = userOrders.filter((order) => order.token === market.tokens.no)
    const result = []
    if (yesOrders.length) {
      result.push({
        type: 'Yes',
        contracts: calculateTotalContracts(yesOrders),
        averagePrice: calculateAveragePrice(yesOrders),
      })
    }
    if (noOrders.length) {
      result.push({
        type: 'No',
        contracts: calculateTotalContracts(noOrders),
        averagePrice: calculateAveragePrice(noOrders),
      })
    }
    return result
  }, [market.tokens, userOrders])

  const indexInArray = groupMarket?.markets
    ? groupMarket.markets.findIndex((marketInArray) => selectedMarket?.slug === marketInArray.slug)
    : undefined

  const onClickPrevious =
    isNumber(indexInArray) && indexInArray > 0
      ? () => {
          onOpenMarketPage(indexInArray - 1)
          trackClicked(ClickEvent.PreviousMarketClick, {
            platform: 'mobile',
          })
        }
      : undefined

  const onClickNext =
    isNumber(indexInArray) && groupMarket?.markets && indexInArray < groupMarket.markets.length - 1
      ? () => {
          onOpenMarketPage(indexInArray + 1)
          trackClicked(ClickEvent.NextMarketClick, {
            platform: 'mobile',
          })
        }
      : undefined

  const yesPrice = useMemo(() => {
    if (!market?.tradePrices) {
      return 50
    }
    if (strategy === 'Buy') {
      return orderType === MarketOrderType.MARKET
        ? new BigNumber(market.tradePrices.buy.market[0])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
        : new BigNumber(market.tradePrices.buy.limit[0])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
    }
    return orderType === MarketOrderType.MARKET
      ? new BigNumber(market.tradePrices.sell.market[0])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
      : new BigNumber(market.tradePrices.sell.limit[0])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
  }, [strategy, market?.tradePrices, orderType])
  const noPrice = useMemo(() => {
    if (!market?.tradePrices) {
      return 50
    }
    if (strategy === 'Buy') {
      return orderType === MarketOrderType.MARKET
        ? new BigNumber(market.tradePrices.buy.market[1])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
        : new BigNumber(market.tradePrices.buy.limit[1])
            .multipliedBy(100)
            .decimalPlaces(1)
            .toNumber()
    }
    return orderType === MarketOrderType.MARKET
      ? new BigNumber(market.tradePrices.sell.market[1])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
      : new BigNumber(market.tradePrices.sell.limit[1])
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber()
  }, [strategy, market?.tradePrices, orderType])

  const trigger = (
    <Box
      border='3px solid'
      borderColor='grey.100'
      borderRadius='12px'
      p='12px'
      onClick={() => {
        const marketIndex = groupMarket?.markets
          ? groupMarket.markets.findIndex((marketInArray) => market?.slug === marketInArray.slug)
          : undefined
        onOpenMarketPage(marketIndex || 0)
      }}
    >
      <HStack w='full'>
        <HStack w='full' justifyContent='space-between'>
          <Box>
            <Text textAlign='left' {...headline}>
              {market.proxyTitle || market.title}
            </Text>
            <HStack gap='8px' mt='4px'>
              {market.isRewardable && <RewardTooltipSmall market={market} />}
              <HStack w={isMobile ? 'full' : 'unset'} gap='4px' color='grey.500'>
                <VolumeIcon width={16} height={16} />
                <Text {...paragraphRegular} color='grey.500'>
                  Volume
                </Text>
                <Text {...paragraphRegular} color='grey.500'>
                  {NumberUtil.convertWithDenomination(market.volumeFormatted, 2)}{' '}
                  {market?.collateralToken.symbol}
                </Text>
              </HStack>
            </HStack>
          </Box>
          <HStack gap='16px'>
            <Text {...h3Medium}>
              {new BigNumber(market.prices[0]).multipliedBy(100).toFixed(0)}%
            </Text>
          </HStack>
        </HStack>
      </HStack>
      <HStack w='full' gap='8px' mt='16px' flexWrap='wrap'>
        {Boolean(userOrdersWithOutcomes?.length) && (
          <HStack gap='8px' my='16px'>
            <Box bg='grey.100' borderRadius='8px' px='4px' py='2px'>
              <Text {...paragraphRegular}>{userOrders?.length} Open orders</Text>
            </Box>
            {userOrdersWithOutcomes?.map((order) => (
              <HStack
                key={order.type}
                bg={order.type === 'Yes' ? 'greenTransparent.100' : 'redTransparent.100'}
                borderRadius='8px'
                px='4px'
                py='2px'
              >
                <Text {...paragraphRegular} color={order.type === 'Yes' ? 'green.500' : 'red.500'}>
                  {order.type} {order.contracts} Contracts | {order.averagePrice}¢
                </Text>
              </HStack>
            ))}
          </HStack>
        )}
      </HStack>
      <HStack w='full' gap='8px'>
        <Button
          w='full'
          h='32px'
          bg={
            selectedMarket?.slug === market.slug && !clobOutcome
              ? 'green.500'
              : 'greenTransparent.100'
          }
          color={selectedMarket?.slug === market.slug && !clobOutcome ? 'white' : 'green.500'}
          borderRadius='8px'
          _hover={{
            bg: 'green.500',
            color: 'white',
          }}
          onClick={(e) => handleOutcomeClicked(e, 0)}
        >
          Yes {yesPrice}¢
        </Button>
        <Button
          w='full'
          h='32px'
          bg={
            selectedMarket?.slug === market.slug && !!clobOutcome ? 'red.500' : 'redTransparent.100'
          }
          color={selectedMarket?.slug === market.slug && !!clobOutcome ? 'white' : 'red.500'}
          borderRadius='8px'
          _hover={{
            bg: 'red.500',
            color: 'white',
          }}
          onClick={(e) => handleOutcomeClicked(e, 1)}
        >
          No {noPrice}¢
        </Button>
      </HStack>
    </Box>
  )

  return (
    <MobileDrawer trigger={trigger} variant='black'>
      <>
        <HStack w='full' justifyContent='space-between'>
          {onClickPrevious ? (
            <Button variant='transparentGreyText' onClick={onClickPrevious}>
              <ArrowLeftIcon width={24} height={24} />
              Previous
            </Button>
          ) : (
            <div />
          )}
          {onClickNext ? (
            <Button variant='transparentGreyText' onClick={onClickNext}>
              Next
              <ArrowRightIcon width={24} height={24} />
            </Button>
          ) : (
            <div />
          )}
        </HStack>
        <MarketPageNergiskMobile />
      </>
    </MobileDrawer>
  )
}
