'use client'

import { Box, Button, HStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import LeaderboardByPointsTab from '@/app/leaderboard/components/leaderboard-by-points-tab'
import LeaderboardByVolumeTab from '@/app/leaderboard/components/leaderboard-by-volume-tab'
import { MainLayout } from '@/components'
import { LeaderboardType } from '@/types'

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(LeaderboardType.BY_POINTS)

  const leaderboardHeader = (
    <HStack w='full' justifyContent='center' gap='4px' mt='4px'>
      <Button
        variant='transparent'
        onClick={() => setLeaderboardType(LeaderboardType.BY_POINTS)}
        bg={leaderboardType === LeaderboardType.BY_POINTS ? 'grey.100' : 'unset'}
      >
        {LeaderboardType.BY_POINTS}
      </Button>
      <Button
        variant='transparent'
        onClick={() => setLeaderboardType(LeaderboardType.BY_VOLUME)}
        bg={leaderboardType === LeaderboardType.BY_VOLUME ? 'grey.100' : 'unset'}
      >
        {LeaderboardType.BY_VOLUME}
      </Button>
    </HStack>
  )

  return (
    <MainLayout layoutPadding={isMobile ? '0' : '16px'} headerComponent={leaderboardHeader}>
      <HStack className='w-full' alignItems='flex-start' justifyContent='center'>
        <Box w={isMobile ? 'full' : '664px'} mt='24px'>
          {leaderboardType === LeaderboardType.BY_POINTS ? (
            <LeaderboardByPointsTab />
          ) : (
            <LeaderboardByVolumeTab />
          )}
        </Box>
      </HStack>
    </MainLayout>
  )
}
