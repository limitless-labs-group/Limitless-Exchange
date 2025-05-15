import {
  Box,
  HStack,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { isAddress } from 'viem'
import Avatar from '@/components/common/avatar'
import Skeleton from '@/components/common/skeleton'
import TablePagination from '@/components/common/table-pagination'
import LeaderIcon from '@/app/leaderboard/components/leader-icon'
import { LeaderboardEntity, LeaderboardResponse } from '@/hooks/use-leaderboard'
import { h2Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { cutUsername } from '@/utils/string'

interface LeaderboardTableProps {
  valueName: string
  isLoading: boolean
  currentPage: number
  handlePageChange: (page: number) => void
  totalPages: number
  leaderboardStats?: LeaderboardResponse
}

export default function LeaderboardTable({
  valueName,
  leaderboardStats,
  isLoading,
  currentPage,
  handlePageChange,
  totalPages,
}: LeaderboardTableProps) {
  const getUserDisplayName = (data: LeaderboardEntity) => {
    if (isAddress(data.displayName)) {
      return truncateEthAddress(data.displayName)
    }
    return isMobile ? cutUsername(data.displayName, 25) : data.displayName
  }

  if (isLoading) {
    return (
      <Box mt='16px' px={isMobile ? '16px' : 0}>
        <Skeleton height={520} />
      </Box>
    )
  }

  if (!leaderboardStats?.data.length) {
    return (
      <Box mt='24px'>
        <Text {...h2Medium}>No data available for requested period.</Text>
      </Box>
    )
  }

  return (
    <>
      <TableContainer overflow={'auto'} mt='16px' mb='8px' px={isMobile ? '16px' : 0}>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th w='28px'></Th>
              <Th w='220px'>Username</Th>
              <Th w='170px' textAlign='right'>
                {valueName}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaderboardStats?.data.map((data, index) => (
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
                    <Avatar account={data.account} avatarUrl={data.pfpUrl} />
                    <NextLink
                      href={`https://basescan.org/address/${data.account}`}
                      target='_blank'
                      rel='noopener'
                      passHref
                    >
                      <Link variant='textLinkSecondary' {...paragraphRegular} isExternal>
                        {getUserDisplayName(data)}
                      </Link>
                    </NextLink>
                  </HStack>
                </Td>
                {/*<Td>{data.outcome}</Td>*/}
                {/*<Td textAlign='right'>{data.shares}</Td>*/}
                <Td textAlign='right'>
                  {NumberUtil.convertWithDenomination(
                    data[valueName === 'Points' ? 'totalPoints' : 'totalVolume'],
                    0
                  )}{' '}
                  {valueName === 'Points' ? '' : 'USDC'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <TablePagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
      />
    </>
  )
}
