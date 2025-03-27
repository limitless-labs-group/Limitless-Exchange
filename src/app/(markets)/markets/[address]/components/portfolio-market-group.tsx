import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import React from 'react'
import PortfolioMarketGroupItem from '@/app/(markets)/markets/[address]/components/portfolio-market-group-item'
import { usePosition, useTradingService } from '@/services'

export default function PortfolioMarketGroup() {
  const { data: allPositions } = usePosition()
  const { market } = useTradingService()

  const currentPosition = allPositions
    ?.filter((position) => position.type === 'clob')
    .find((position) => position.market.slug === market?.slug)

  return (
    <TableContainer overflow={'auto'} mt='16px' mb='8px'>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th>Outcome</Th>
            <Th>QTY</Th>
            <Th w='72px'></Th>
            <Th w='60px'></Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentPosition && Boolean(+currentPosition.tokensBalance.yes) && (
            <PortfolioMarketGroupItem outcome={0} quantity={currentPosition.tokensBalance.yes} />
          )}
          {currentPosition && Boolean(+currentPosition.tokensBalance.no) && (
            <PortfolioMarketGroupItem outcome={1} quantity={currentPosition.tokensBalance.no} />
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
