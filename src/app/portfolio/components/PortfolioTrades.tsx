import { PortfolioTradesItem } from '@/app/portfolio/components/PortfolioTradesItem'
import { useHistory } from '@/services'
import { Flex, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const PortfolioTrades = () => {
  const { trades, getTrades } = useHistory()

  useEffect(() => {
    getTrades()
  }, [])

  return trades?.length == 0 ? (
    <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
      <Text color={'fontLight'}>No trading history yet</Text>
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
          {trades?.map((trade) => (
            <PortfolioTradesItem key={uuidv4()} trade={trade} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
