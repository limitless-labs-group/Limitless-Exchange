import {
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { uuidv4 } from '@walletconnect/utils'
import BigNumber from 'bignumber.js'
import React from 'react'
import { formatUnits } from 'viem'
import { checkPriceIsInRange } from '@/components/common/markets/clob-widget/utils'
import Skeleton from '@/components/common/skeleton'
import { useMarketOrders } from '@/hooks/use-market-orders'
import { useOrderBook } from '@/hooks/use-order-book'
import CloseIcon from '@/resources/icons/close-icon.svg'
import GemIcon from '@/resources/icons/gem-icon.svg'
import { useAccount, useTradingService } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { ClobPosition } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface ClobOrdersTableProps {
  marketType?: string
}

export default function ClobOrdersTable({ marketType }: ClobOrdersTableProps) {
  const { market } = useTradingService()
  const { account } = useAccount()
  const { data: userOrders, isLoading: userOrdersLoading } = useMarketOrders(market?.slug)
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()
  const { data: orderBook } = useOrderBook(market?.slug)
  const getOrderOutcome = (order: ClobPosition) => {
    return order.token === market?.tokens.yes ? 'Yes' : 'No'
  }

  const orderBookPriceRange = orderBook
    ? [
        new BigNumber(orderBook.adjustedMidpoint)
          .minus(new BigNumber(orderBook.maxSpread))
          .multipliedBy(100)
          .decimalPlaces(0)
          .toNumber(),
        new BigNumber(orderBook.adjustedMidpoint)
          .plus(new BigNumber(orderBook.maxSpread))
          .multipliedBy(100)
          .decimalPlaces(0)
          .toNumber(),
      ]
    : [50, 50]

  const getContractSizeFormatted = (contracts: string) => {
    return NumberUtil.formatThousands(
      formatUnits(BigInt(contracts), market?.collateralToken.decimals || 6),
      6
    )
  }

  const getRemainingContractsSize = (originalSize: string, remainingSize: string) => {
    const leftToFill = new BigNumber(originalSize).minus(new BigNumber(remainingSize)).toString()
    return NumberUtil.formatThousands(
      formatUnits(BigInt(leftToFill), market?.collateralToken.decimals || 6),
      6
    )
  }

  const handleDeleteOrder = async (orderId: string) => {
    await privateClient.delete(`/orders/${orderId}`)
    await queryClient.refetchQueries({
      queryKey: ['user-orders', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['locked-balance', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['order-book', market?.slug],
    })
  }

  const getTotalAmountInOrder = (order: ClobPosition) => {
    const totalAmountRaw = new BigNumber(order.originalSize).multipliedBy(order.price).toString()
    return NumberUtil.formatThousands(
      formatUnits(BigInt(totalAmountRaw), market?.collateralToken.decimals || 6),
      2
    )
  }

  return (
    <>
      <TableContainer overflowY={'auto'} my='16px' maxH='178px'>
        <Table variant={'noPaddingsOnSides'}>
          <Thead position='sticky' top='0' zIndex={1}>
            <Tr>
              <Th minW={marketType ? '80px' : '92px'}>Action</Th>
              <Th minW={marketType ? '88px' : '100px'}>Outcome</Th>
              <Th isNumeric minW={marketType ? '68px' : '80px'}>
                Price
              </Th>
              <Th isNumeric minW={marketType ? '96px' : '108px'}>
                Contracts
              </Th>
              <Th minW={marketType ? '126px' : '138px'} isNumeric>
                Filled
              </Th>
              {/*<Th isNumeric minW='104px'>*/}
              {/*  Reward*/}
              {/*</Th>*/}
              <Th isNumeric minW='160px'>
                Total
              </Th>
              <Th isNumeric minW='24px'></Th>
            </Tr>
          </Thead>
          <Tbody>
            {userOrders?.map((order) => (
              <Tr key={order.id}>
                <Td pl={0}>
                  <HStack gap='4px'>
                    {checkPriceIsInRange(+order.price, orderBookPriceRange) &&
                      market?.isRewardable && <GemIcon />}
                    <Text {...paragraphRegular}>{order.side === 'BUY' ? 'Buy' : 'Sell'}</Text>
                  </HStack>
                </Td>
                <Td>{getOrderOutcome(order)}</Td>
                <Td textAlign='end'>{NumberUtil.toFixed(+order.price * 100)}¢</Td>
                <Td textAlign='end'>{getContractSizeFormatted(order.originalSize)}</Td>
                <Td textAlign='end'>
                  {getRemainingContractsSize(order.originalSize, order.remainingSize)} /{' '}
                  {getContractSizeFormatted(order.originalSize)}
                </Td>
                {/*<Td textAlign='end'>22 {market?.collateralToken.symbol}</Td>*/}
                <Td textAlign='end'>
                  {getTotalAmountInOrder(order)} {market?.collateralToken.symbol}
                </Td>
                <Td>
                  <Button
                    color={'fontLight'}
                    bg={'bgLight'}
                    colorScheme={'none'}
                    borderRadius={'full'}
                    size={'xs'}
                    fontSize={13}
                    p={0}
                    minW='unset'
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <CloseIcon width={16} height={16} />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {userOrdersLoading && (
        <VStack w='full' gap='15px'>
          {[...Array(3)].map(() => (
            <Skeleton height={24} key={uuidv4()} />
          ))}
        </VStack>
      )}
      {!userOrdersLoading && !userOrders?.length && !!account && (
        <Text {...paragraphMedium} my='16px' textAlign='center'>
          No opened orders.
        </Text>
      )}
    </>
  )
}
