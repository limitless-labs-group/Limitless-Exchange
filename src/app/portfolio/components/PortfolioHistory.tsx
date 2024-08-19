import { HistoryRedeem, HistoryTrade, useHistory } from '@/services'
import { Flex, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { PortfolioHistoryTradeItem } from '@/app/portfolio/components/PortfolioHistoryTradeItem'
import { v4 as uuidv4 } from 'uuid'
import { PortfolioHistoryRedeemItem } from '@/app/portfolio/components/PortfolioHistoryRedeemItem'

export const PortfolioHistory = () => {
  const { trades, getTrades, redeems, getRedeems } = useHistory()

  useEffect(() => {
    getTrades()
    getRedeems()
  }, [])

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
        <Thead>
          <Tr>
            <Th minW='92px'>Action</Th>
            <Th minW='124px'>Position</Th>
            <Th isNumeric minW='124px'>
              Contracts
            </Th>
            <Th isNumeric minW='140px'>
              Amount
            </Th>
            <Th w='420px'>Market</Th>
            <Th w='96px'>TX</Th>
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
