import { PortfolioHistoryTableItem } from '@/app/portfolio/components/PortfolioHistoryTableItem'
import { useHistory } from '@/services'
import {
  Flex,
  GridProps,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useEffect } from 'react'

export const PortfolioHistoryTable = ({ ...props }: GridProps) => {
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
            <Th pl={0}>Market</Th>
            <Th>Outcome</Th>
            <Th>Strategy</Th>
            <Th isNumeric>Amount</Th>
            <Th isNumeric>Contracts</Th>
            <Th pr={0}>Tx</Th>
          </Tr>
        </Thead>
        <Tbody>
          {trades?.map((trade, id) => (
            <PortfolioHistoryTableItem key={id} trade={trade} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
    // <Grid templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6} {...props}>
    //   {trades?.map((trade, id) => (
    //     <PortfolioHistoryTableItem key={id} trade={trade} />
    //   ))}
    // </Grid>
  )
}
