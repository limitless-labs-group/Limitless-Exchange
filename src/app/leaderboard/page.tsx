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
import TablePagination from '@/components/common/table-pagination'
import Leaders from '@/app/leaderboard/components/leaders'
import { MainLayout } from '@/components'
import WreathsBronzeIcon from '@/resources/icons/wreaths_bronze.svg'
import WreathsGoldIcon from '@/resources/icons/wreaths_gold.svg'
import WreathsSilverIcon from '@/resources/icons/wreaths_silver.svg'
import { h1Regular, headlineRegular, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { LeaderboardSort } from '@/types'

const sortOptions = [
  LeaderboardSort.DAILY,
  LeaderboardSort.WEEKLY,
  LeaderboardSort.MONTHLY,
  LeaderboardSort.ALL_TIME,
]

const mockData = [
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
  {
    name: 'AntiMAGA',
    outcome: 'YES',
    shares: 18213812,
    value: 123123282,
    collateralToken: 'USDC',
  },
  {
    name: 'TWP',
    outcome: 'NO',
    shares: 1821381,
    value: 12312328,
    collateralToken: 'USDC',
  },
  {
    name: 'alfie',
    outcome: 'YES',
    shares: 182138,
    value: 1231232,
    collateralToken: 'USDC',
  },
  {
    name: 'sqqqqq',
    outcome: 'YES',
    shares: 18213,
    value: 123123,
    collateralToken: 'USDC',
  },
  {
    name: 'asd',
    outcome: 'YES',
    shares: 1821,
    value: 12312,
    collateralToken: 'USDC',
  },
]

const TableContainerWrapper = ({ children }: PropsWithChildren) => {
  return (
    <TableContainer overflow={'auto'} mt='16px' mb='8px'>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th w='28px'></Th>
            <Th w='220px'>Username</Th>
            <Th w='82px'>Outcome</Th>
            <Th w='100px' textAlign='right'>
              Shares
            </Th>
            <Th w='170px' textAlign='right'>
              Value
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
    (window.sessionStorage.getItem('LEADERBOARD_SORT') as LeaderboardSort) ?? LeaderboardSort.DAILY
  )
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(mockData.length / 10)

  const currentData = mockData.slice((currentPage - 1) * 10, currentPage * 10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilterItemClicked = (option: LeaderboardSort) => {
    window.sessionStorage.setItem('LEADERBOARD_SORT', option)
    setSelectedSortFilter(option)
  }

  return (
    <MainLayout>
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
            <Text {...headlineRegular}>{selectedSortFilter} - 1152 people</Text>
          </HStack>
          <Leaders />
          <TableContainerWrapper>
            {currentData.map((data, index) => (
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
                    <Box w='16px' h='16px' borderRadius='100%' bg='#D9D9D9' />
                    <Text>{data.name}</Text>
                  </HStack>
                </Td>
                <Td>{data.outcome}</Td>
                <Td textAlign='right'>{data.shares}</Td>
                <Td textAlign='right'>
                  {data.value} {data.collateralToken}
                </Td>
              </Tr>
            ))}
          </TableContainerWrapper>
          <TablePagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
          />
        </Box>
      </HStack>
    </MainLayout>
  )
}
