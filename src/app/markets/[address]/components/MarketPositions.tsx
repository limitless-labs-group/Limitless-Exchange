import { collateralToken, defaultChain } from '@/constants'
import { useIsMobile } from '@/hooks'
import { HistoryPosition, useHistory, useTradingService } from '@/services'
import { NumberUtil } from '@/utils'
import { StackProps, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const MarketPositions = ({ ...props }: StackProps) => {
  const { market } = useTradingService()

  const { positions: allMarketsPositions } = useHistory()

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id === market?.address[defaultChain.id].toLowerCase()
      ),
    [allMarketsPositions]
  )

  const getOutcomeNotation = (position: HistoryPosition) => {
    const outcomeTokenId = position.outcomeTokenId ?? 0
    const defaultOutcomes = ['Yes', 'No']

    return market?.outcomeTokens[outcomeTokenId] ?? defaultOutcomes[outcomeTokenId]
  }

  const isMobile = useIsMobile()

  return Number(positions?.length) > 0 ? (
    <TableContainer overflow={'auto'}>
      <Table variant={'simple'}>
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
                    3
                  )} ${collateralToken.symbol}`}
                </Text>
              </Td>
              <Td px={2} isNumeric>
                <Text>{`${NumberUtil.toFixed(position.collateralAmount, 6)} ${
                  collateralToken.symbol
                }`}</Text>
              </Td>
              <Td px={2} isNumeric>
                <Text>{`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)}`}</Text>
              </Td>
              <Td pl={2} pr={0} isNumeric>
                <Text>{`${NumberUtil.toFixed(position.outcomeTokenAmount, 6)} ${
                  collateralToken.symbol
                }`}</Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  ) : (
    <></>
  )
}
