import { Box, Button, HStack, Table, TableContainer, Text, Th, Thead, Tr } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Skeleton from '@/components/common/skeleton'
import { Order, useOrderBook } from '@/hooks/use-order-book'
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
import { NumberUtil } from '@/utils'

export default function Orderbook() {
  const [orderbookSide, setOrderbookSide] = useState(0)
  const { trackChanged } = useAmplitude()
  const { market } = useTradingService()
  const { data: orderbook, isLoading: orderBookLoading } = useOrderBook(market?.slug)

  function calculatePercent(array: Order[]) {
    const totalSize = array.reduce((sum, item) => sum + item.size, 0) // Total size of the array

    let cumulativePercent = 0 // Track cumulative percentage
    return array.map((item) => {
      const percent = (item.size / totalSize) * 100 // Percent value
      cumulativePercent += percent // Update cumulative percentage
      return {
        ...item,
        percent: percent.toFixed(2), // Percent relative to total
        cumulativePercent: cumulativePercent.toFixed(2), // Cumulative percent
      }
    })
  }

  const orderBookData = useMemo(() => {
    if (!orderbook) {
      return {
        bids: [],
        asks: [],
      }
    }

    const bids = orderbookSide
      ? orderbook.asks.map((ask) => {
          return {
            ...ask,
            price: +new BigNumber(1).minus(new BigNumber(ask.price)).toFixed(2),
          }
        })
      : orderbook.bids

    const asks = orderbookSide
      ? orderbook.bids.map((bid) => {
          return {
            ...bid,
            price: +new BigNumber(1).minus(new BigNumber(bid.price)).toFixed(2),
          }
        })
      : orderbook.asks.reverse()
    return {
      bids: calculatePercent(bids),
      asks: calculatePercent(asks.reverse()),
    }
  }, [orderbook, orderbookSide])

  const calculateTotalContractsPrice = (size: number, price: number) => {
    const contractsFormatted = formatUnits(BigInt(size), market?.collateralToken.decimals || 6)
    return NumberUtil.convertWithDenomination(
      new BigNumber(contractsFormatted).multipliedBy(new BigNumber(price)).toString(),
      6
    )
  }

  const spread = useMemo(() => {
    if (!orderBookData) {
      return '0'
    }
    if (!orderBookData.asks.length || !orderBookData.bids.length) {
      return '0'
    }
    return (
      Math.abs(
        new BigNumber(orderBookData.asks[0].price)
          .minus(new BigNumber(orderBookData.bids[0].price))
          .toNumber()
      ) * 100
    ).toFixed(0)
  }, [orderBookData])

  return (
    <>
      <HStack w='full' justifyContent='space-between' mb='14px'>
        <Text {...h3Regular}>Order book</Text>
        <HStack w={'152px'} bg='grey.200' borderRadius='8px' py='2px' px={'2px'}>
          <Button
            h={isMobile ? '28px' : '20px'}
            flex='1'
            py='2px'
            borderRadius='6px'
            bg={!orderbookSide ? 'grey.50' : 'unset'}
            color='grey.800'
            _hover={{
              backgroundColor: !orderbookSide ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
            }}
            onClick={() => {
              trackChanged<OrderBookSideChangedMetadata>(ChangeEvent.OrderBookSideChanged, {
                type: 'Yes selected',
                marketAddress: market?.slug as string,
              })
              setOrderbookSide(0)
            }}
          >
            <Text {...controlsMedium} color={!orderbookSide ? 'font' : 'fontLight'}>
              YES
            </Text>
          </Button>
          <Button
            h={isMobile ? '28px' : '20px'}
            flex='1'
            borderRadius='6px'
            py='2px'
            bg={orderbookSide ? 'grey.50' : 'unset'}
            color='grey.800'
            _hover={{
              backgroundColor: orderbookSide ? 'grey.50' : 'rgba(255, 255, 255, 0.10)',
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
              setOrderbookSide(1)
            }}
          >
            <Text {...controlsMedium} color={orderbookSide ? 'font' : 'fontLight'}>
              NO
            </Text>
          </Button>
        </HStack>
      </HStack>
      <TableContainer overflow={'auto'}>
        <Table variant={'noPaddingsOnSides'}>
          <Thead>
            <Tr>
              <Th minW='348px'>Trade</Th>
              <Th isNumeric minW='88px'>
                Price
              </Th>
              <Th isNumeric minW='136px'>
                Contracts
              </Th>
              <Th isNumeric minW='144px'>
                Total
              </Th>
            </Tr>
          </Thead>
        </Table>
      </TableContainer>
      {!orderbook || orderBookLoading ? (
        <Skeleton height={108} />
      ) : (
        <Box position='relative'>
          <Box maxH='108px' overflowX='auto' position='relative'>
            <>
              {orderBookData.asks.map((item, index) => (
                <HStack gap={0} key={index} h='36px'>
                  <Box w='348px' h='full'>
                    <Box w={`${item.cumulativePercent}%`} bg='red.500' opacity={0.1} h='full' />
                  </Box>
                  <HStack w='88px' h='full' justifyContent='flex-end' pr='8px'>
                    <Text {...paragraphRegular} color='red.500'>
                      {NumberUtil.toFixed(new BigNumber(item.price).multipliedBy(100).toFixed(), 0)}
                      ¢
                    </Text>
                  </HStack>
                  <HStack w='136px' h='full' justifyContent='flex-end' pr='8px'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.convertWithDenomination(
                        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                        6
                      )}
                    </Text>
                  </HStack>
                  <HStack w='144px' h='full' justifyContent='flex-end'>
                    <Text {...paragraphRegular}>
                      {calculateTotalContractsPrice(item.size, item.price)}{' '}
                      {market?.collateralToken.symbol}
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
          borderColor='grey.500'
          py='8px'
        >
          <Box flex={1} pl='8px'>
            <Text {...paragraphRegular} color={orderbookSide ? 'red.500' : 'green.500'}>
              {orderbookSide ? 'NO' : 'YES'}
            </Text>
          </Box>
          <Box flex={1}>
            <Text {...paragraphRegular} color='grey.500'>
              Spread {spread}¢
            </Text>
          </Box>
        </HStack>
      )}
      {!orderbook || orderBookLoading ? (
        <Skeleton height={108} />
      ) : (
        <Box position='relative'>
          <Box maxH='108px' overflowX='auto' position='relative'>
            <>
              {orderBookData.bids.map((item, index) => (
                <HStack gap={0} key={index} h='36px'>
                  <Box w='348px' h='full'>
                    <Box w={`${item.cumulativePercent}%`} bg='green.500' opacity={0.1} h='full' />
                  </Box>
                  <HStack w='88px' h='full' justifyContent='flex-end' pr='8px'>
                    <Text {...paragraphRegular} color='green.500'>
                      {NumberUtil.toFixed(
                        new BigNumber(item.price).multipliedBy(new BigNumber(100)).toFixed(),
                        0
                      )}
                      ¢
                    </Text>
                  </HStack>
                  <HStack w='136px' h='full' justifyContent='flex-end' pr='8px'>
                    <Text {...paragraphRegular}>
                      {NumberUtil.convertWithDenomination(
                        formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                        6
                      )}
                    </Text>
                  </HStack>
                  <HStack w='144px' h='full' justifyContent='flex-end'>
                    <Text {...paragraphRegular}>
                      {calculateTotalContractsPrice(item.size, item.price)}{' '}
                      {market?.collateralToken.symbol}
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
