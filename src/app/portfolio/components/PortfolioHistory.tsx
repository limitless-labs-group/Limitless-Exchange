import { Flex, Table, TableContainer, Tbody, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react'
import React, { memo, PropsWithChildren, useEffect, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Skeleton from '@/components/common/skeleton'
import { PortfolioHistoryRedeemItem } from '@/app/portfolio/components/PortfolioHistoryRedeemItem'
import { PortfolioHistoryTradeItem } from '@/app/portfolio/components/PortfolioHistoryTradeItem'
import { HistoryRedeem, HistoryTrade, useHistory } from '@/services'

const TableContainerWrapper = ({ children }: PropsWithChildren) => {
  return (
    <TableContainer overflow={'auto'}>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th minW='92px'>Action</Th>
            <Th minW='124px'>Position</Th>
            <Th isNumeric minW='124px'>
              Contracts
            </Th>
            <Th isNumeric minW='120px'>
              Amount
            </Th>
            <Th minW='120px'>Date</Th>
            <Th w='420px'>Market</Th>
            <Th w='96px'>TX</Th>
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </TableContainer>
  )
}

const History = ({ userMenuLoading }: { userMenuLoading: boolean }) => {
  const { trades, getTrades, redeems, getRedeems, tradesAndPositionsLoading } = useHistory()

  useEffect(() => {
    getTrades()
    getRedeems()
  }, [])

  const tradesAndRedeems = useMemo(() => {
    const _tradesAndRedeems = [...(trades ?? []), ...(redeems ?? [])]
    _tradesAndRedeems.sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))
    return _tradesAndRedeems
  }, [trades, redeems])

  const historyLoading = useMemo(() => {
    return tradesAndPositionsLoading || !tradesAndRedeems || userMenuLoading
  }, [tradesAndPositionsLoading, tradesAndRedeems, userMenuLoading])

  const noTradesAndRedeems = useMemo(() => {
    return (
      !userMenuLoading &&
      !tradesAndPositionsLoading &&
      tradesAndRedeems &&
      tradesAndRedeems.length === 0
    )
  }, [userMenuLoading, tradesAndPositionsLoading, tradesAndRedeems])

  if (historyLoading) {
    return (
      <>
        <TableContainerWrapper />
        <VStack w='full' gap='8px'>
          {[...Array(5)].map((index) => (
            <Skeleton height={36} key={index} />
          ))}
        </VStack>
      </>
    )
  }

  if (noTradesAndRedeems) {
    return (
      <>
        <TableContainerWrapper />
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No trading history</Text>
        </Flex>
      </>
    )
  }

  return (
    <TableContainerWrapper>
      {tradesAndRedeems.map((item) =>
        'strategy' in item ? (
          <PortfolioHistoryTradeItem key={uuidv4()} trade={item as HistoryTrade} />
        ) : (
          <PortfolioHistoryRedeemItem key={uuidv4()} redeem={item as HistoryRedeem} />
        )
      )}
    </TableContainerWrapper>
  )

  // return tradesAndRedeems?.length == 0 ? (
  //   <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
  //     <Text color={'fontLight'}>No trading history</Text>
  //   </Flex>
  // ) : (
  //   <>
  //
  //     {(tradesAndPositionsLoading || !tradesAndRedeems || userMenuLoading) && (
  //       <VStack w='full' gap='8px'>
  //         {[...Array(5)].map((index) => (
  //           <Skeleton height={36} key={index} />
  //         ))}
  //       </VStack>
  //     )}
  //   </>
  // )
}

export const PortfolioHistory = memo(History)
