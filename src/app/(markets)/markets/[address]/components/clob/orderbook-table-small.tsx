import { Box, Button, HStack, Text } from '@chakra-ui/react'
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

export default function OrderBookTableSmall({
  orderBookData,
  orderbookSide,
  setOrderbookSide,
  spread,
  calculateTotalContractsPrice,
}: OrderBookData) {
  const { market } = useTradingService()
  const { data: orderbook, isLoading: orderBookLoading } = useOrderBook(market?.slug)
  const { trackChanged } = useAmplitude()
  return (
    <>
      <Text {...h3Regular}>Order book</Text>
      <HStack w={'240px'} bg='grey.200' borderRadius='8px' py='2px' px={'2px'} my='16px'>
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
      <HStack gap={0} w='full' borderBottom='1px solid' borderColor='grey.100'>
        <Box w='25%' {...paragraphRegular} color='grey.500' textAlign='right'>
          Price
        </Box>
        <Box w='30%' {...paragraphRegular} color='grey.500' textAlign='right'>
          Contracts
        </Box>
        <Box w='45%' {...paragraphRegular} color='grey.500' textAlign='right'>
          Total
        </Box>
      </HStack>
      <Box position='relative'>
        <Box maxH='162px' minH='36px' overflow='auto' position='relative'>
          {!orderbook || orderBookLoading ? (
            <Box w='full'>
              <Skeleton height={108} />
            </Box>
          ) : (
            orderBookData.asks.map((item, index) => (
              <HStack w='full' key={index} position='relative' gap={0} py='8px'>
                <Box position='absolute' top={0} w='full'>
                  <Box w={`${+item.cumulativePercent}%`} bg='red.500' opacity={0.1} height='36px' />
                </Box>
                <Box w='25%'>
                  <Text {...paragraphRegular} color='red.500' textAlign='right'>
                    {NumberUtil.toFixed(new BigNumber(item.price).multipliedBy(100).toFixed(), 0)}¢
                  </Text>
                </Box>
                <Box w='30%'>
                  <Text {...paragraphRegular} textAlign='right'>
                    {NumberUtil.convertWithDenomination(
                      formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                      6
                    )}
                  </Text>
                </Box>
                <Box w='45%' textAlign='right'>
                  <Text {...paragraphRegular}>
                    {calculateTotalContractsPrice(item.size, item.price)}{' '}
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
      <Box position='relative'>
        <Box maxH='162px' minH='36px' overflow='auto' position='relative'>
          {!orderbook || orderBookLoading ? (
            <Box w='full'>
              <Skeleton height={108} />
            </Box>
          ) : (
            orderBookData.bids.map((item, index) => (
              <HStack w='full' key={index} position='relative' gap={0} py='8px'>
                <Box position='absolute' top={0} w='full'>
                  <Box
                    w={`${+item.cumulativePercent}%`}
                    bg='green.500'
                    opacity={0.1}
                    height='36px'
                  />
                </Box>
                <Box w='25%'>
                  <Text {...paragraphRegular} color='green.500' textAlign='right'>
                    {NumberUtil.toFixed(new BigNumber(item.price).multipliedBy(100).toFixed(), 0)}¢
                  </Text>
                </Box>
                <Box w='30%'>
                  <Text {...paragraphRegular} textAlign='right'>
                    {NumberUtil.convertWithDenomination(
                      formatUnits(BigInt(item.size), market?.collateralToken.decimals || 6),
                      6
                    )}
                  </Text>
                </Box>
                <Box w='45%' textAlign='right'>
                  <Text {...paragraphRegular}>
                    {calculateTotalContractsPrice(item.size, item.price)}{' '}
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
    </>
  )
}
