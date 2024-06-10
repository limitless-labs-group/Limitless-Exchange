import { defaultChain } from '@/constants';
import { HistoryPosition, useHistory, useTradingService } from '@/services';
import { NumberUtil } from '@/utils';
import { Box, Divider, StackProps, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const MarketPositions = ({ ...props }: StackProps) => {
  const { market } = useTradingService();

  const { positions: allMarketsPositions } = useHistory();

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter((position) => position.market.id === market?.address[defaultChain.id].toLowerCase()),
    [allMarketsPositions, market],
  );

  const getOutcomeNotation = (position: HistoryPosition) => {
    const outcomeTokenId = position.outcomeIndex ?? 0;
    const defaultOutcomes = ['Yes', 'No'];

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId];
  };

  return Number(positions?.length) > 0 ? (
    <Box mt={-5}>
      <Text fontWeight={'semibold'} color={'fontLight'} mb={1}>
        Positions
      </Text>
      <Divider orientation='horizontal' mt={1} />
      <TableContainer mt={'12px'}>
        <Table variant={'simple'} colorScheme={'gray'}>
          <Thead>
            <Tr>
              <Th px={2}>Outcome</Th>
              <Th px={2} isNumeric>
                Amount
              </Th>
              <Th px={2} isNumeric>
                Contracts
              </Th>
              <Th pl={2} pr={0} isNumeric>
                To win
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {positions?.map((position) => (
              <Tr pos={'relative'} key={uuidv4()}>
                <Td px={2}>
                  <Text color={getOutcomeNotation(position) === 'Yes' ? 'green' : 'red'}>
                    {`${getOutcomeNotation(position)} ${NumberUtil.toFixed(
                      position.latestTrade?.outcomeTokenPrice,
                      3,
                    )} ${market?.tokenTicker[defaultChain.id]}`}
                  </Text>
                </Td>
                <Td px={2} isNumeric>
                  <Text>{`${NumberUtil.toFixed(position.collateralAmount, 6)} ${
                    market?.tokenTicker[defaultChain.id]
                  }`}</Text>
                </Td>
                <Td px={2} isNumeric>
                  <Text>{`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)}`}</Text>
                </Td>
                <Td pl={2} pr={0} isNumeric>
                  <Text>{`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} ${
                    market?.tokenTicker[defaultChain.id]
                  }`}</Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <></>
  );
};
