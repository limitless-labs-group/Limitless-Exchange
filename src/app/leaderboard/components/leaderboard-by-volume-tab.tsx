import { Box, Button, ButtonGroup, HStack, Text } from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import Skeleton from '@/components/common/skeleton'
import LeaderboardTabContainer from '@/app/leaderboard/components/leaderboard-tab-container'
import LeaderboardTable from '@/app/leaderboard/components/leaderboard-table'
import Leaders from '@/app/leaderboard/components/leaders'
import { leaderboardSortOptions } from '@/app/leaderboard/utils'
import { useDateRanges } from '@/hooks/use-date-range'
import { useLeaderboard, useTopThreeLeaders } from '@/hooks/use-leaderboard'
import { ChangeEvent, useAmplitude } from '@/services'
import { headlineRegular, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { LeaderboardSort } from '@/types'

export default function LeaderboardByVolumeTab() {
  const [selectedSortFilter, setSelectedSortFilter] = useState<LeaderboardSort>(
    (window.sessionStorage.getItem('LEADERBOARD_SORT') as LeaderboardSort) ??
      LeaderboardSort.ALL_TIME
  )

  const { MONTHLY_LEADERBOARD_PERIOD, WEEKLY_LEADERBOARD_PERIOD } = useDateRanges()

  const period = useMemo(() => {
    switch (selectedSortFilter) {
      case LeaderboardSort.MONTHLY:
        return MONTHLY_LEADERBOARD_PERIOD
      case LeaderboardSort.WEEKLY:
        return WEEKLY_LEADERBOARD_PERIOD
      default:
        return LeaderboardSort.ALL_TIME
    }
  }, [selectedSortFilter, MONTHLY_LEADERBOARD_PERIOD, WEEKLY_LEADERBOARD_PERIOD])

  const [currentPage, setCurrentPage] = useState(1)

  const { trackChanged } = useAmplitude()

  const { data: leaderboardStats, isLoading } = useLeaderboard(
    selectedSortFilter,
    currentPage,
    'volume'
  )

  const { data: topThreeLeaders, isLoading: topThreeLoading } = useTopThreeLeaders(
    selectedSortFilter,
    'volume'
  )

  const totalPages = Math.ceil(leaderboardStats ? leaderboardStats.totalPages : 0)

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
      tab: 'volume',
    })
    setSelectedSortFilter(option)
    setCurrentPage(1)
  }

  const renderLeaders = useMemo(() => {
    if (!topThreeLeaders?.data.data.length) {
      return null
    }
    return <Leaders data={topThreeLeaders?.data.data} />
  }, [topThreeLeaders?.data.data])

  return (
    <LeaderboardTabContainer heading='Volume Leaderboard'>
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
            {leaderboardSortOptions.map((option) => (
              <Button
                variant='grey'
                key={uuidv4()}
                bg={option === selectedSortFilter ? 'grey.50' : 'grey.100'}
                onClick={() => {
                  // trackClicked(ClickEvent.SortClicked, {
                  //   oldValue: selectedSortFilter,
                  //   newValue: option,
                  // })
                  handleFilterItemClicked(option)
                }}
                _hover={{ bg: option === selectedSortFilter ? 'grey.50' : 'grey.200' }}
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
          <Box w='160px' px={isMobile ? '16px' : 0}>
            <Skeleton height={20} />
          </Box>
        ) : (
          <Text {...headlineRegular}>
            {period}
            {','} {leaderboardStats?.totalRows || 0} people
          </Text>
        )}
      </HStack>
      {topThreeLoading ? (
        <Box my='16px' px={isMobile ? '16px' : 0}>
          <Skeleton height={132} />
        </Box>
      ) : (
        renderLeaders
      )}
      <LeaderboardTable
        leaderboardStats={leaderboardStats}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        isLoading={isLoading}
        valueName='Points'
      />
    </LeaderboardTabContainer>
  )
}
