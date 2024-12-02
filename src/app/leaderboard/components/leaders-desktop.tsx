import { Box, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import Avatar from '@/components/common/avatar'
import LeaderboardFirst from '@/resources/icons/leaderboard/leaderboard-position-1.svg'
import LeaderboardSecond from '@/resources/icons/leaderboard/leaderboard-position-2.svg'
import LeaderboardThird from '@/resources/icons/leaderboard/leaderboard-position-3.svg'
import { controlsMedium } from '@/styles/fonts/fonts.styles'

export default function LeadersDesktop() {
  return (
    <HStack my='16px' gap='8px' alignItems='flex-end' h='132px'>
      <Box>
        <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
          <Avatar account='asd' />
          <Text {...controlsMedium} fontSize='16px'>
            Habibi
          </Text>
        </HStack>
        <LeaderboardSecond />
      </Box>
      <Box>
        <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
          <Avatar account='asd' />
          <Text {...controlsMedium} fontSize='16px'>
            Habibi
          </Text>
        </HStack>
        <LeaderboardFirst />
      </Box>
      <Box>
        <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
          <Avatar account='asd' />
          <Text {...controlsMedium} fontSize='16px'>
            Habibi
          </Text>
        </HStack>
        <LeaderboardThird />
      </Box>
    </HStack>
  )
}
