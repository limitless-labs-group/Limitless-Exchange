import { PortfolioHistoryRedeemItem, PortfolioHistoryTradeItem } from '@/app/portfolio/components';
import { HistoryRedeem, HistoryTrade, useHistory } from '@/services';
import { Flex, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const PortfolioHistory = () => {
  const { trades, getTrades, redeems, getRedeems } = useHistory();

  useEffect(() => {
    getTrades();
    getRedeems();
  }, []);

  const tradesAndRedeems = useMemo(() => {
    const _tradesAndRedeems = [...(trades ?? []), ...(redeems ?? [])];
    _tradesAndRedeems.sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp));
    return _tradesAndRedeems;
  }, [trades, redeems]);

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
            ),
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
