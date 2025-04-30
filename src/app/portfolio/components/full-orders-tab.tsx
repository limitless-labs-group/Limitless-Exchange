import {
  Box,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Button,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import React from 'react'
import { formatUnits } from 'viem'
import CloseIcon from '@/resources/icons/close-icon.svg'
import GemIcon from '@/resources/icons/gem-icon.svg'
import { LiveOrder } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface FullOrdersTabProps {
  orders: LiveOrder[]
  yesPositionId: string
  decimals: number
  symbol: string
}

export default function FullOrdersTab({
  orders,
  yesPositionId,
  decimals,
  symbol,
}: FullOrdersTabProps) {
  const queryClient = useQueryClient()
  const privateClient = useAxiosPrivateClient()

  const getOutcome = (token: string) => {
    return token === yesPositionId ? 'Yes' : 'No'
  }

  const getContracts = (size: string) => {
    const formatted = formatUnits(BigInt(size), decimals)
    return NumberUtil.convertWithDenomination(formatted, 2)
  }

  const getContractsFilled = (remainedSize: string, originalSize: string) => {
    const difference = new BigNumber(originalSize).minus(new BigNumber(remainedSize)).toString()
    const formatted = formatUnits(BigInt(difference), decimals)
    return NumberUtil.convertWithDenomination(formatted, 2)
  }

  const convertPrice = (price: string) => {
    return new BigNumber(price).multipliedBy(100).decimalPlaces(1).toString()
  }

  const getTotalAmount = (originalSize: string, price: string) => {
    const sizeFormatted = formatUnits(BigInt(originalSize), decimals)
    return new BigNumber(price).multipliedBy(sizeFormatted).decimalPlaces(2).toString()
  }

  const handleDeleteOrder = async (orderId: string) => {
    await privateClient.delete(`/orders/${orderId}`)
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
  }

  return (
    <Box>
      <TableContainer overflow={'auto'}>
        <Table variant={'noPaddingsOnSides'}>
          <Thead>
            <Tr>
              <Th w='80px'>Action</Th>
              <Th w='80px'>Position</Th>
              <Th w='80px'>Contracts</Th>
              <Th w='112px'>Filled</Th>
              <Th w='112px'>Price</Th>
              <Th w='120px'>Total</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <HStack gap='4px'>
                    {order.isEarning && <GemIcon width={16} height={16} />}
                    <Text {...paragraphMedium}>{order.side === 'BUY' ? 'Buy' : 'Sell'}</Text>
                  </HStack>
                </Td>
                <Td>{getOutcome(order.token)}</Td>
                <Td>{getContracts(order.originalSize)}</Td>
                <Td>
                  {getContractsFilled(order.remainingSize, order.originalSize)}/
                  {getContracts(order.originalSize)}
                </Td>
                <Td>{convertPrice(order.price)}¢</Td>
                <Td>
                  {getTotalAmount(order.originalSize, order.price)} {symbol}
                </Td>
                <Td textAlign='right'>
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
    </Box>
  )
}
