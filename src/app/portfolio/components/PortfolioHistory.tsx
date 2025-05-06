import {
  Flex,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import React, { memo, PropsWithChildren, useCallback } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import Skeleton from '@/components/common/skeleton'
import { PortfolioHistoryRedeemItem } from '@/app/portfolio/components/PortfolioHistoryRedeemItem'
import { PortfolioHistoryTradeItem } from '@/app/portfolio/components/PortfolioHistoryTradeItem'
import { HistoryRedeem, HistoryTrade, useInfinityHistory } from '@/services'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

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

const History = () => {
  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isLoading: isHistoryLoading,
  } = useInfinityHistory()

  const getNextPage = useCallback(
    debounce(async () => fetchNextPage(), 1000),
    []
  )

  //@ts-ignore
  const historyFlat = historyData?.pages.flatMap((page) => page.data?.data)
  if (isHistoryLoading) {
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

  if (!historyFlat || historyFlat.length === 0) {
    return (
      <>
        <TableContainerWrapper />
        <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
          <Text color={'fontLight'}>No trading history</Text>
        </Flex>
      </>
    )
  }

  const getHistoryItemToRender = (item: HistoryTrade | HistoryRedeem) => {
    if (!item) {
      return <></>
    }
    // @ts-ignore
    if (item.action) {
      return (
        <PortfolioHistoryRedeemItem
          key={(item as HistoryRedeem).blockTimestamp}
          redeem={item as HistoryRedeem}
        />
      )
    }
    // @ts-ignore
    if (item.market) {
      return (
        <PortfolioHistoryTradeItem
          key={(item as HistoryTrade).blockTimestamp}
          trade={item as HistoryTrade}
        />
      )
    }
  }

  return (
    <InfiniteScroll
      className='scroll'
      dataLength={historyFlat?.length ?? 0}
      next={getNextPage}
      hasMore={hasNextPage}
      style={{ width: '100%' }}
      loader={
        <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
          <Loader />
          <Text {...paragraphRegular}>Loading more history</Text>
        </HStack>
      }
    >
      <TableContainerWrapper>
        {historyFlat.map((item) => getHistoryItemToRender(item))}
      </TableContainerWrapper>
    </InfiniteScroll>
  )
}

export const PortfolioHistory = memo(History)
