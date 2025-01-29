import { Box, Button, HStack, Table, TableContainer, Text, Th, Thead, Tr } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Skeleton from '@/components/common/skeleton'
import { OrderBookData } from '@/app/(markets)/markets/[address]/components/clob/types'
import { useOrderBook } from '@/hooks/use-order-book'
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

export default function OrderbookTableLarge({
  orderBookData,
  orderbookSide,
  setOrderbookSide,
  spread,
  calculateTotalContractsPrice,
  lastPrice,
}: OrderBookData) {
  const { market } = useTradingService()
  const { data: orderbook, isLoading: orderBookLoading } = useOrderBook(market?.slug)
  const { trackChanged } = useAmplitude()

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
          <Box maxH='162px' minH='36px' overflow='auto' position='relative'>
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
              {orderbookSide ? 'NO' : 'YES'} {lastPrice}¢
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
          <Box maxH='162px' minH='36px' overflow='auto' position='relative'>
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
