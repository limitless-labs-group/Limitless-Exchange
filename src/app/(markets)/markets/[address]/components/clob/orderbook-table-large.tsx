import {
  Box,
  Button,
  HStack,
  Link,
  Table,
  TableContainer,
  Text,
  Th,
  Thead,
  Tr,
  useOutsideClick,
} from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import NextLink from 'next/link'
import React, {
  LegacyRef,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import { useMarketOrders } from '@/hooks/use-market-orders'
import useMarketRewardsIncentive from '@/hooks/use-market-rewards'
import { useOrderBook } from '@/hooks/use-order-book'
import GemIcon from '@/resources/icons/gem-icon.svg'
import PartFilledCircleIcon from '@/resources/icons/partially-filled-circle.svg'
import {
  ChangeEvent,
  ClickEvent,
  OrderBookSideChangedMetadata,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useMarketRewards } from '@/services/MarketsService'
import {
  captionMedium,
  controlsMedium,
  h3Regular,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'
import { calculateDisplayRange } from '@/utils/market'

export const TableText = ({ children }: PropsWithChildren) => {
  return (
    <Text {...paragraphMedium} color='grey.500' letterSpacing='normal'>
      {children}
    </Text>
  )
}

export default function OrderbookTableLarge({
  orderBookData,
  spread,
  lastPrice,
  deleteBatchOrders,
}: OrderBookData) {
  const { market, clobOutcome: outcome, setClobOutcome: setOutcome } = useTradingService()
  const { data: orderbook, isLoading: orderBookLoading } = useOrderBook(market?.slug)
  const { data: userOrders } = useMarketOrders(market?.slug)
  const { trackChanged, trackClicked } = useAmplitude()
  const ref = useRef<HTMLElement>()
  const { data: marketRewards } = useMarketRewards(market?.slug, market?.isRewardable)
  const { data: marketRewardsTotal } = useMarketRewardsIncentive(market?.slug, market?.tradeType)

  const [rewardsButtonClicked, setRewardButtonClicked] = useState(false)
  const [rewardButtonHovered, setRewardButtonHovered] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [outcome, market])

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      if (!linkHovered) {
        setRewardButtonClicked(false)
        return
      }
      return
    },
  })

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

  const highLightRewardsCells = rewardsButtonClicked || rewardButtonHovered

  const minRewardsSize = orderbook?.minSize ? orderbook.minSize : maxUint256.toString()

  const range = calculateDisplayRange(orderbook?.adjustedMidpoint)

  const url =
    'https://limitlesslabs.notion.site/Limitless-Docs-0e59399dd44b492f8d494050969a1567#19304e33c4b9808498d9ea69e68a0cb4'

  const tooltipContent = (
    <Box>
      <Text {...paragraphMedium} as='span'>
        Place limit order near the midpoint to get rewarded.{' '}
      </Text>
      <NextLink
        href={url}
        target='_blank'
        rel='noopener'
        passHref
        onMouseEnter={() => setLinkHovered(true)}
        onMouseLeave={() => setLinkHovered(false)}
      >
        <Link variant='textLinkSecondary' {...paragraphRegular} isExternal color='grey.500'>
          Learn more
        </Link>
      </NextLink>
      <HStack w='full' mt='12px' justifyContent='space-between'>
        <Text {...paragraphMedium}>Daily reward:</Text>
        <Text {...paragraphMedium}>
          {marketRewardsTotal?.totalRewards ? marketRewardsTotal.totalRewards.toFixed(0) : '0'}{' '}
          {market?.collateralToken.symbol}
        </Text>
      </HStack>
      <HStack w='full' mt='4px' justifyContent='space-between'>
        <Text {...paragraphMedium}>Max Spread:</Text>
        <Text {...paragraphMedium}>
          &#177;
          {new BigNumber(orderbook?.maxSpread ? orderbook.maxSpread : '0')
            .multipliedBy(100)
            .toString()}
          ¢
        </Text>
      </HStack>
      <HStack w='full' mt='4px' justifyContent='space-between'>
        <Text {...paragraphMedium}>Min order size:</Text>
        <Text {...paragraphMedium}>
          {formatUnits(BigInt(minRewardsSize), market?.collateralToken.decimals || 6)}
        </Text>
      </HStack>
      <HStack w='full' mt='4px' justifyContent='space-between'>
        <Text {...paragraphMedium}>Current range:</Text>
        <Text {...paragraphMedium}>
          {range.lower}¢ - {range.upper}¢
        </Text>
      </HStack>
    </Box>
  )

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

  const handleRewardsClicked = () => {
    trackClicked(ClickEvent.RewardsButtonClicked, {
      visible: rewardsButtonClicked ? 'off' : 'on',
    })
    setRewardButtonClicked(!rewardsButtonClicked)
  }

  return (
    <>
      <HStack w='full' justifyContent='space-between' mb='14px'>
        <Text {...h3Regular}>Order book</Text>
        <HStack gap='16px'>
          <Box position='relative'>
            {market?.isRewardable && (
              <HStack
                gap='4px'
                borderRadius='8px'
                py='4px'
                px='8px'
                bg={rewardsButtonClicked ? 'blue.500' : 'blueTransparent.100'}
                cursor='pointer'
                onClick={handleRewardsClicked}
                onMouseEnter={() => {
                  const timer = setTimeout(() => {
                    setRewardButtonHovered(true)
                  }, 300)
                  return () => clearTimeout(timer)
                }}
                onMouseLeave={() => setRewardButtonHovered(false)}
                ref={ref as LegacyRef<HTMLDivElement>}
              >
                <Image src='/assets/images/gem-icon.svg' alt='gem' width={16} height={16} />
                <Text {...paragraphMedium} color={rewardsButtonClicked ? 'white' : 'blue.500'}>
                  {marketRewards && Boolean(marketRewards?.length)
                    ? `Earnings ${NumberUtil.toFixed(marketRewards[0].totalUnpaidReward, 6)} ${
                        market?.collateralToken.symbol
                      }`
                    : 'Earn Rewards'}
                </Text>
              </HStack>
            )}
            {(rewardsButtonClicked || rewardButtonHovered) && (
              <Box
                position='absolute'
                bg='grey.50'
                border='1px solid'
                borderColor='grey.200'
                boxShadow='0px 1px 4px 0px rgba(2, 6, 23, 0.05)'
                w='260px'
                p='8px'
                rounded='8px'
                right={0}
                minH='128px'
                zIndex={201}
                onMouseEnter={() => setRewardButtonHovered(true)}
                onMouseLeave={() => {
                  if (!linkHovered) {
                    setRewardButtonHovered(false)
                  }
                }}
              >
                {tooltipContent}
              </Box>
            )}
          </Box>
          <HStack w={'152px'} bg='grey.200' borderRadius='8px' py='2px' px={'2px'}>
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
        </HStack>
      </HStack>
      <TableContainer overflow={'auto'}>
        <Table variant={'noPaddingsOnSides'}>
          <Thead>
            <Tr>
              <Th minW='348px'>
                <TableText>Trade</TableText>
              </Th>
              <Th isNumeric minW='88px'>
                <TableText>Price</TableText>
              </Th>
              <Th isNumeric minW='136px'>
                <TableText>Contracts</TableText>
              </Th>
              <Th isNumeric minW='144px'>
                <TableText>Total</TableText>
              </Th>
            </Tr>
          </Thead>
        </Table>
      </TableContainer>
      {!orderbook || orderBookLoading ? (
        <Skeleton height={108} />
      ) : (
        <Box position='relative'>
          <Box maxH='162px' minH='36px' overflow='auto' position='relative' ref={containerRef}>
            <>
              {orderBookData.asks.map((item, index) => (
                <HStack
                  gap={0}
                  key={index}
                  h='36px'
                  bg={
                    highLightRewardsCells && checkPriceIsInRange(item.price, orderBookPriceRange)
                      ? 'blueTransparent.100'
                      : 'unset'
                  }
                >
                  <Box w='348px' h='full'>
                    <Box w={`${item.cumulativePercent}%`} bg='red.500' opacity={0.1} h='full' />
                  </Box>
                  <HStack w='88px' h='full' justifyContent='flex-end' pr='8px' gap='4px'>
                    {checkIfOrderIsRewarded(
                      item.price,
                      userOrders,
                      outcome,
                      minRewardsSize,
                      market?.tokens
                    ) &&
                      checkPriceIsInRange(+item.price, orderBookPriceRange) &&
                      market?.isRewardable && <GemIcon />}
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
                        placement='top-end'
                        onDelete={async () => onDeleteBatchOrders(item.price)}
                      >
                        <PartFilledCircleIcon />
                      </OrdersTooltip>
                    )}
                    <Text {...paragraphRegular} color='red.500'>
                      {new BigNumber(item.price).multipliedBy(100).decimalPlaces(1).toFixed()}¢
                    </Text>
                  </HStack>
                  <HStack w='136px' h='full' justifyContent='flex-end' pr='8px'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.convertWithDenomination(
                        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                        2
                      )}
                    </Text>
                  </HStack>
                  <HStack w='144px' h='full' justifyContent='flex-end'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.toFixed(item.cumulativePrice, 2)} {market?.collateralToken.symbol}
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </>
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
      )}
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
      {!orderbook || orderBookLoading ? (
        <Skeleton height={108} />
      ) : (
        <Box position='relative'>
          <Box maxH='162px' minH='36px' overflow='auto' position='relative'>
            <>
              {orderBookData.bids.map((item, index) => (
                <HStack
                  gap={0}
                  key={index}
                  h='36px'
                  bg={
                    highLightRewardsCells && checkPriceIsInRange(item.price, orderBookPriceRange)
                      ? 'blueTransparent.100'
                      : 'unset'
                  }
                >
                  <Box w='348px' h='full'>
                    <Box w={`${item.cumulativePercent}%`} bg='green.500' opacity={0.1} h='full' />
                  </Box>
                  <HStack w='88px' h='full' justifyContent='flex-end' pr='8px' gap='4px'>
                    {checkIfOrderIsRewarded(
                      item.price,
                      userOrders,
                      outcome,
                      minRewardsSize,
                      market?.tokens
                    ) &&
                      checkPriceIsInRange(+item.price, orderBookPriceRange) &&
                      market?.isRewardable && <GemIcon />}
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
                        placement='top-end'
                        onDelete={async () => onDeleteBatchOrders(item.price)}
                      >
                        <PartFilledCircleIcon />
                      </OrdersTooltip>
                    )}
                    <Text {...paragraphRegular} color='green.500'>
                      {new BigNumber(item.price).multipliedBy(100).decimalPlaces(1).toFixed()}¢
                    </Text>
                  </HStack>
                  <HStack w='136px' h='full' justifyContent='flex-end' pr='8px'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.convertWithDenomination(
                        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                        2
                      )}
                    </Text>
                  </HStack>
                  <HStack w='144px' h='full' justifyContent='flex-end'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.toFixed(item.cumulativePrice, 2)} {market?.collateralToken.symbol}
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </>
          </Box>
          <Box
            position='absolute'
            bg='green.500'
            px='2px'
            py='4px'
            rounded='4px'
            bottom='8px'
            left='8px'
          >
            <Text {...captionMedium} color='white'>
              Bids
            </Text>
          </Box>
        </Box>
      )}
    </>
  )
}
