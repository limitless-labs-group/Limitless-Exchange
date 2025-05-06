import { Box, Button, HStack, Text, useOutsideClick } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits, maxUint256 } from 'viem'
import {
  checkIfOrderIsRewarded,
  checkPriceIsInRange,
  getUserOrdersForPrice,
  hasOrdersForThisOrderBookEntity,
} from '@/components/common/markets/clob-widget/utils'
import Skeleton from '@/components/common/skeleton'
import OrdersTooltip from '@/app/(markets)/markets/[address]/components/clob/orders-tooltip'
import { OrderBookData } from '@/app/(markets)/markets/[address]/components/clob/types'
import { TableText } from './orderbook-table-large'
import { RewardTooltipContent } from './reward-tooltip-content'
import { useMarketOrders } from '@/hooks/use-market-orders'
import { useOrderBook } from '@/hooks/use-order-book'
import GemIcon from '@/resources/icons/gem-icon.svg'
import PartFilledCircleIcon from '@/resources/icons/partially-filled-circle.svg'
import {
  ChangeEvent,
  OrderBookSideChangedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import {
  captionMedium,
  controlsMedium,
  h3Regular,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'

export default function OrderBookTableSmall({
  orderBookData,
  spread,
  lastPrice,
  deleteBatchOrders,
}: OrderBookData) {
  const { market, clobOutcome: outcome, setClobOutcome: setOutcome } = useTradingService()
  const { data: orderbook, isLoading: orderBookLoading } = useOrderBook(
    market?.slug,
    market?.tradeType
  )
  const { data: userOrders } = useMarketOrders(market?.slug)
  const { trackChanged } = useAmplitude()
  const containerRef = useRef<HTMLDivElement>(null)

  const ref = useRef<HTMLElement>()

  const [rewardsButtonClicked, setRewardButtonClicked] = useState(false)
  const [rewardButtonHovered, setRewardButtonHovered] = useState(false)

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => setRewardButtonClicked(false),
  })

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [outcome, market])

  const highLightRewardsCells = rewardsButtonClicked || rewardButtonHovered

  const orderBookPriceRange = orderbook
    ? [
        new BigNumber(
          outcome
            ? new BigNumber(1).minus(orderbook.adjustedMidpoint).toString()
            : orderbook.adjustedMidpoint
        )
          .minus(new BigNumber(orderbook.maxSpread))
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber(),
        new BigNumber(
          outcome
            ? new BigNumber(1).minus(orderbook.adjustedMidpoint).toString()
            : orderbook.adjustedMidpoint
        )
          .plus(new BigNumber(orderbook.maxSpread))
          .multipliedBy(100)
          .decimalPlaces(1)
          .toNumber(),
      ]
    : [50, 50]

  const minRewardsSize = orderbook?.minSize ? orderbook.minSize : maxUint256.toString()

  const onDeleteBatchOrders = async (price: number) => {
    const orders = getUserOrdersForPrice(
      price,
      outcome,
      userOrders,
      market?.tokens
    ) as ClobPosition[]
    await deleteBatchOrders.mutateAsync({
      orders: orders.map((order) => order.id),
    })
  }

  return (
    <Box mt='12px'>
      <HStack w='full' justifyContent='space-between'>
        <Text {...h3Regular}>Order Book</Text>
        {market?.isRewardable && (
          <Box position='relative'>
            <RewardTooltipContent contentHoverCallback={setRewardButtonHovered} />
          </Box>
        )}
      </HStack>
      <HStack w={'240px'} bg='grey.200' borderRadius='8px' py='2px' px={'2px'} my='16px'>
        <Button
          h={isMobile ? '28px' : '20px'}
          flex='1'
          py='2px'
          borderRadius='6px'
          bg={!outcome ? 'grey.50' : 'unset'}
          color='grey.800'
          _hover={{
            backgroundColor: !outcome ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
          }}
          onClick={() => {
            trackChanged<OrderBookSideChangedMetadata>(ChangeEvent.OrderBookSideChanged, {
              type: 'Yes selected',
              marketAddress: market?.slug as string,
            })
            setOutcome(0)
          }}
        >
          <Text {...controlsMedium} color={!outcome ? 'font' : 'fontLight'}>
            YES
          </Text>
        </Button>
        <Button
          h={isMobile ? '28px' : '20px'}
          flex='1'
          borderRadius='6px'
          py='2px'
          bg={outcome ? 'grey.50' : 'unset'}
          color='grey.800'
          _hover={{
            backgroundColor: outcome ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
          }}
          _disabled={{
            opacity: '50%',
            pointerEvents: 'none',
          }}
          onClick={() => {
            trackChanged<OrderBookSideChangedMetadata>(ChangeEvent.OrderBookSideChanged, {
              type: 'No selected',
              marketAddress: market?.slug as string,
            })
            setOutcome(1)
          }}
        >
          <Text {...controlsMedium} color={outcome ? 'font' : 'fontLight'}>
            NO
          </Text>
        </Button>
      </HStack>
      <HStack gap={0} w='full' borderBottom='1px solid' borderColor='grey.100'>
        <Box w='25%' textAlign='right'>
          <TableText>Price</TableText>
        </Box>
        <Box w='30%' textAlign='right'>
          <TableText>Contracts</TableText>
        </Box>
        <Box w='45%' textAlign='right'>
          <TableText>Total</TableText>
        </Box>
      </HStack>
      <Box position='relative'>
        <Box maxH='162px' minH='36px' overflow='auto' position='relative' ref={containerRef}>
          {!orderbook || orderBookLoading ? (
            <Box w='full'>
              <Skeleton height={108} />
            </Box>
          ) : (
            orderBookData.asks
              .sort((a, b) => b.price - a.price)
              .map((item, index) => (
                <HStack
                  w='full'
                  key={index}
                  position='relative'
                  gap={0}
                  py='8px'
                  bg={
                    highLightRewardsCells && checkPriceIsInRange(item.price, orderBookPriceRange)
                      ? 'blueTransparent.100'
                      : 'unset'
                  }
                >
                  <Box position='absolute' top={0} w='full'>
                    <Box
                      w={`${+item.cumulativePercent}%`}
                      bg='red.500'
                      opacity={0.1}
                      height='36px'
                    />
                  </Box>
                  <HStack gap='4px' w='25%' justifyContent='flex-end' h='20px'>
                    {checkIfOrderIsRewarded(
                      item.price,
                      userOrders,
                      outcome,
                      minRewardsSize,
                      market?.tokens
                    ) &&
                      checkPriceIsInRange(+item.price, orderBookPriceRange) &&
                      market?.isRewardable && <GemIcon width={16} height={16} />}
                    {hasOrdersForThisOrderBookEntity(
                      item.price,
                      outcome,
                      userOrders,
                      market?.tokens
                    ) && (
                      <OrdersTooltip
                        orders={
                          getUserOrdersForPrice(
                            item.price,
                            outcome,
                            userOrders,
                            market?.tokens
                          ) as ClobPosition[]
                        }
                        decimals={market?.collateralToken.decimals || 6}
                        side='ask'
                        placement='top-start'
                        onDelete={async () => onDeleteBatchOrders(item.price)}
                      >
                        <PartFilledCircleIcon />
                      </OrdersTooltip>
                    )}
                    <Text {...paragraphRegular} color='red.500' textAlign='right'>
                      {new BigNumber(item.price).multipliedBy(100).decimalPlaces(1).toFixed()}¢
                    </Text>
                  </HStack>
                  <Box w='30%'>
                    <Text {...paragraphRegular} textAlign='right'>
                      {NumberUtil.convertWithDenomination(
                        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                        2
                      )}
                    </Text>
                  </Box>
                  <Box w='45%' textAlign='right'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.convertWithDenomination(item.cumulativePrice, 2)}{' '}
                      {market?.collateralToken.symbol}
                    </Text>
                  </Box>
                </HStack>
              ))
          )}
        </Box>
        <Box
          position='absolute'
          bg='red.500'
          px='2px'
          py='4px'
          rounded='4px'
          bottom='8px'
          left='8px'
        >
          <Text {...captionMedium} color='white'>
            Asks
          </Text>
        </Box>
      </Box>
      {!orderbook || orderBookLoading ? (
        <Box my='8px'>
          <Skeleton height={20} />
        </Box>
      ) : (
        <HStack
          w='full'
          borderTop='1px solid'
          borderBottom='1px solid'
          borderColor='grey.100'
          py='8px'
        >
          <Box flex={1} pl='8px'>
            {lastPrice && (
              <Text {...paragraphRegular} color={outcome ? 'red.500' : 'green.500'}>
                Last: {outcome ? 'NO' : 'YES'} {lastPrice}¢
              </Text>
            )}
          </Box>
          {Boolean(Number(spread)) ? (
            <Box flex={1}>
              <Text {...paragraphRegular} color='grey.500'>
                Spread {spread}¢
              </Text>
            </Box>
          ) : null}
        </HStack>
      )}
      <Box position='relative'>
        <Box maxH='162px' minH='36px' overflow='auto' position='relative'>
          {!orderbook || orderBookLoading ? (
            <Box w='full'>
              <Skeleton height={108} />
            </Box>
          ) : (
            orderBookData.bids.map((item, index) => (
              <HStack
                w='full'
                key={index}
                position='relative'
                gap={0}
                py='8px'
                bg={
                  highLightRewardsCells && checkPriceIsInRange(item.price, orderBookPriceRange)
                    ? 'blueTransparent.100'
                    : 'unset'
                }
              >
                <Box position='absolute' top={0} w='full'>
                  <Box
                    w={`${+item.cumulativePercent}%`}
                    bg='green.500'
                    opacity={0.1}
                    height='36px'
                  />
                </Box>
                <HStack gap='4px' w='25%' justifyContent='flex-end' h='20px'>
                  {checkIfOrderIsRewarded(
                    item.price,
                    userOrders,
                    outcome,
                    minRewardsSize,
                    market?.tokens
                  ) &&
                    checkPriceIsInRange(+item.price, orderBookPriceRange) &&
                    market?.isRewardable && <GemIcon width={16} height={16} />}
                  {hasOrdersForThisOrderBookEntity(
                    item.price,
                    outcome,
                    userOrders,
                    market?.tokens
                  ) && (
                    <OrdersTooltip
                      orders={
                        getUserOrdersForPrice(
                          item.price,
                          outcome,
                          userOrders,
                          market?.tokens
                        ) as ClobPosition[]
                      }
                      decimals={market?.collateralToken.decimals || 6}
                      side='bid'
                      placement='top-start'
                      onDelete={async () => onDeleteBatchOrders(item.price)}
                    >
                      <PartFilledCircleIcon />
                    </OrdersTooltip>
                  )}
                  <Text {...paragraphRegular} color='green.500' textAlign='right'>
                    {new BigNumber(item.price).multipliedBy(100).decimalPlaces(1).toFixed()}¢
                  </Text>
                </HStack>
                <Box w='30%'>
                  <Text {...paragraphRegular} textAlign='right'>
                    {NumberUtil.convertWithDenomination(
                      formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                      2
                    )}
                  </Text>
                </Box>
                <Box w='45%' textAlign='right'>
                  <Text {...paragraphRegular}>
                    {NumberUtil.convertWithDenomination(item.cumulativePrice, 2)}{' '}
                    {market?.collateralToken.symbol}
                  </Text>
                </Box>
              </HStack>
            ))
          )}
        </Box>
        <Box
          position='absolute'
          bg='green.500'
          px='2px'
          py='4px'
          rounded='4px'
          top='8px'
          left='8px'
        >
          <Text {...captionMedium} color='white'>
            Bids
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
