import { PortfolioHistoryRedeemItem, PortfolioHistoryTradeItem } from '@/app/portfolio/components'
import { HistoryMarket, HistoryRedeem, HistoryTrade, useHistory } from '@/services'
import { Flex, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Hash } from 'viem'
import { Address } from '@/types'

export const PortfolioHistory = () => {
  // const { trades, getTrades, redeems, getRedeems } = useHistory()
  //
  // useEffect(() => {
  //   getTrades()
  //   getRedeems()
  // }, [])

  const trades = [
    {
      market: {
        id: '0x1',
        condition_id: '0x',
        paused: false,
        closed: false,
        collateral: {
          symbol: 'USDC',
        },
      },
      strategy: 'Buy',
      outcomeIndex: 0,
      outcomeTokenAmounts: ['50', '50'],
      outcomeTokenAmount: '50',
      outcomeTokenPrice: '35',
      outcomeTokenNetCost: '21',
      collateralAmount: '35',
      blockTimestamp: new Date().getTime().toString(),
      transactionHash: '0x1234',
    },
    {
      market: {
        id: '0x2',
        condition_id: '0x',
        paused: false,
        closed: false,
        collateral: {
          symbol: 'USDC',
        },
      },
      strategy: 'Buy',
      outcomeIndex: 0,
      outcomeTokenAmounts: ['50', '50'],
      outcomeTokenAmount: '50',
      outcomeTokenPrice: '35',
      outcomeTokenNetCost: '21',
      collateralAmount: '35',
      blockTimestamp: new Date().getTime().toString(),
      transactionHash: '0x1234',
    },
  ]

  const redeems = [
    {
      payout: '10000000',
      collateralAmount: '100',
      conditionId: '0x3',
      indexSets: ['1', '2'],
      outcomeIndex: 1,
      blockTimestamp: new Date().getTime().toString(),
      transactionHash: '0x1',
      collateralToken: 'USC',
    },
    {
      payout: '10000000',
      collateralAmount: '100',
      conditionId: '0x4',
      indexSets: ['1', '2'],
      outcomeIndex: 1,
      blockTimestamp: new Date().getTime().toString(),
      transactionHash: '0x1',
      collateralToken: 'USC',
    },
  ]

  const tradesAndRedeems = useMemo(() => {
    const _tradesAndRedeems = [...(trades ?? []), ...(redeems ?? [])]
    _tradesAndRedeems.sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))
    return _tradesAndRedeems
  }, [trades, redeems])

  return tradesAndRedeems?.length == 0 ? (
    <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
      <Text color={'fontLight'}>No trading history</Text>
    </Flex>
  ) : (
    <TableContainer overflow={'auto'}>
      <Table variant={'simple'}>
        {/* <TableCaption>Trading history</TableCaption> */}
        <Thead>
          <Tr>
            <Th pl={0} pr={2} minW={'250px'}>
              Market
            </Th>
            <Th px={2}>Outcome</Th>
            <Th px={2}>Strategy</Th>
            <Th px={2} isNumeric>
              Amount
            </Th>
            <Th px={2} isNumeric>
              Contracts
            </Th>
            <Th pl={2} pr={0}>
              Tx
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {tradesAndRedeems?.map((item) =>
            'strategy' in item ? (
              <PortfolioHistoryTradeItem key={uuidv4()} trade={item as HistoryTrade} />
            ) : (
              <PortfolioHistoryRedeemItem key={uuidv4()} redeem={item as HistoryRedeem} />
            )
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
