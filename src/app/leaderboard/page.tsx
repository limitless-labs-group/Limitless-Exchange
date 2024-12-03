'use client'

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import React, { PropsWithChildren, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Avatar from '@/components/common/avatar'
import Skeleton from '@/components/common/skeleton'
import TablePagination from '@/components/common/table-pagination'
import Leaders from '@/app/leaderboard/components/leaders'
import { MainLayout } from '@/components'
import { useLeaderboard, useTopThreeLeaders } from '@/hooks/use-leaderboard'
import WreathsBronzeIcon from '@/resources/icons/wreaths_bronze.svg'
import WreathsGoldIcon from '@/resources/icons/wreaths_gold.svg'
import WreathsSilverIcon from '@/resources/icons/wreaths_silver.svg'
import { ChangeEvent, useAmplitude } from '@/services'
import { h1Regular, h2Medium, headlineRegular, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { LeaderboardSort } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'

const sortOptions = [
  // LeaderboardSort.DAILY,
  // LeaderboardSort.WEEKLY,
  LeaderboardSort.MONTHLY,
  LeaderboardSort.ALL_TIME,
]

const TableContainerWrapper = ({ children }: PropsWithChildren) => {
  return (
    <TableContainer overflow={'auto'} mt='16px' mb='8px'>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th w='28px'></Th>
            <Th w='220px'>Username</Th>
            <Th w='170px' textAlign='right'>
              Total Volume
            </Th>
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </TableContainer>
  )
}

const LeaderIcon = ({ index }: { index: number }) => {
  if (!index) {
    return <WreathsGoldIcon />
  }
  if (index === 1) {
    return <WreathsSilverIcon />
  }
  return <WreathsBronzeIcon />
}

export default function LeaderboardPage() {
  const [selectedSortFilter, setSelectedSortFilter] = useState<LeaderboardSort>(
    (window.sessionStorage.getItem('LEADERBOARD_SORT') as LeaderboardSort) ??
      LeaderboardSort.ALL_TIME
  )
  const [currentPage, setCurrentPage] = useState(1)

  const { trackChanged } = useAmplitude()

  const { data: leaderboardStats, isLoading } = useLeaderboard(selectedSortFilter, currentPage)

  const { data: topThreeLeaders, isLoading: topThreeLoading } =
    useTopThreeLeaders(selectedSortFilter)

  const totalPages = Math.ceil(leaderboardStats ? +leaderboardStats.data.totalCount / 10 : 1)

  const handlePageChange = (page: number) => {
    trackChanged(ChangeEvent.LeaderboardPageChanged, {
      from: currentPage,
      to: page,
    })
    setCurrentPage(page)
  }

  const handleFilterItemClicked = (option: LeaderboardSort) => {
    window.sessionStorage.setItem('LEADERBOARD_SORT', option)
    trackChanged(ChangeEvent.LeaderboardViewChanged, {
      option,
    })
    setSelectedSortFilter(option)
  }

  const renderTable = useMemo(() => {
    if (!leaderboardStats?.data.data.length) {
      return (
        <Box mt='24px'>
          <Text {...h2Medium}>No data available for requested period.</Text>
        </Box>
      )
    }
    return (
      <>
        <TableContainerWrapper>
          {leaderboardStats?.data?.data.map((data, index) => (
            <Tr key={index}>
              <Td h='44px'>
                {currentPage === 1 && index < 3 ? (
                  <LeaderIcon index={index} />
                ) : (
                  `${(currentPage - 1) * 10 + (index + 1)}`
                )}
              </Td>
              <Td>
                <HStack gap='4px'>
                  <Avatar account={data.account} />
                  <Text>{truncateEthAddress(data.account)}</Text>
                </HStack>
              </Td>
              {/*<Td>{data.outcome}</Td>*/}
              {/*<Td textAlign='right'>{data.shares}</Td>*/}
              <Td textAlign='right'>
                {NumberUtil.convertWithDenomination(data.totalVolume, 0)} USDC
              </Td>
            </Tr>
          ))}
        </TableContainerWrapper>
        <TablePagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      </>
    )
  }, [currentPage, leaderboardStats?.data.data, totalPages])

  const renderLeaders = useMemo(() => {
    if (!topThreeLeaders?.data.data.length) {
      return null
    }
    return <Leaders data={topThreeLeaders?.data.data} />
  }, [topThreeLeaders?.data.data])

  return (
    <MainLayout layoutPadding={isMobile ? '0' : '16px'}>
      <HStack
        className='w-full'
        alignItems='flex-start'
        w={isMobile ? 'full' : 'calc(100vw - 690px)'}
        justifyContent='center'
      >
        <Box w={isMobile ? 'full' : '664px'} mt='24px'>
          <Text {...h1Regular} textAlign='center'>
            Leaderboard
          </Text>
          <HStack
            w='full'
            flexDirection={isMobile ? 'column' : 'row'}
            justifyContent='space-between'
            gap='16px'
            mt={isMobile ? '32px' : '40px'}
          >
            <HStack
              spacing={2}
              mt={isMobile ? '16px' : '8px'}
              mb={isMobile ? '24px' : '8px'}
              wrap={'wrap'}
              alignItems={'start'}
              overflowX='auto'
              h={isMobile ? '32px' : '24px'}
              px={isMobile ? '16px' : 0}
            >
              <ButtonGroup variant='outline' gap='2px' p='2px' bg='grey.100' borderRadius='8px'>
                {sortOptions.map((option) => (
                  <Button
                    variant='grey'
                    key={uuidv4()}
                    bg={option === selectedSortFilter ? 'grey.50' : 'unset'}
                    onClick={() => {
                      // trackClicked(ClickEvent.SortClicked, {
                      //   oldValue: selectedSortFilter,
                      //   newValue: option,
                      // })
                      handleFilterItemClicked(option)
                    }}
                    _hover={{ bg: option === selectedSortFilter ? 'grey.50' : 'grey.400' }}
                    borderRadius='8px'
                    h={isMobile ? '28px' : '20px'}
                    whiteSpace='nowrap'
                    {...paragraphMedium}
                    color={'grey.800'}
                    p={'2px 12px 2px 12px'}
                    marginInlineStart='0px !important'
                    position={isMobile ? 'unset' : 'relative'}
                  >
                    {option}
                  </Button>
                ))}
              </ButtonGroup>
            </HStack>
            {isLoading ? (
              <Box w='160px'>
                <Skeleton height={20} />
              </Box>
            ) : (
              <Text {...headlineRegular}>
                {selectedSortFilter} - {leaderboardStats?.data.totalCount || 0} people
              </Text>
            )}
          </HStack>
          {topThreeLoading ? (
            <Box my='16px'>
              <Skeleton height={132} />
            </Box>
          ) : (
            renderLeaders
          )}
          {isLoading ? (
            <Box mt='16px'>
              <Skeleton height={520} />
            </Box>
          ) : (
            renderTable
          )}
        </Box>
      </HStack>
    </MainLayout>
  )
}
