import { Box, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import Avatar from '@/components/common/avatar'
import { LeaderboardEntity } from '@/hooks/use-leaderboard'
import LeaderboardFirst from '@/resources/icons/leaderboard/leaderboard-position-1.svg'
import LeaderboardSecond from '@/resources/icons/leaderboard/leaderboard-position-2.svg'
import LeaderboardThird from '@/resources/icons/leaderboard/leaderboard-position-3.svg'
import { controlsMedium } from '@/styles/fonts/fonts.styles'
import { truncateEthAddress } from '@/utils'
import { cutUsername } from '@/utils/string'

interface LeadersProps {
  data?: LeaderboardEntity[]
}

export default function LeadersDesktop({ data }: LeadersProps) {
  if (!data?.length) return null

  return (
    <HStack my='16px' gap='8px' alignItems='flex-end' h='132px'>
      {data[1] && (
        <Box>
          <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
            <Avatar account={data[1].account || '0x'} avatarUrl={data[1].pfpUrl} />
            <Text {...controlsMedium} fontSize='16px'>
              {data[1].displayName
                ? cutUsername(data[1].displayName, 17)
                : truncateEthAddress(data[1].account)}
            </Text>
          </HStack>
          <LeaderboardSecond />
        </Box>
      )}
      {data[0] && (
        <Box>
          <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
            <Avatar account={data[0].account || '0x'} />
            <Text {...controlsMedium} fontSize='16px'>
              {data[0].displayName
                ? cutUsername(data[0].displayName, 17)
                : truncateEthAddress(data[0].account)}
            </Text>
          </HStack>
          <LeaderboardFirst />
        </Box>
      )}
      {data[2] && (
        <Box>
          <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
            <Avatar account={data[2].account || '0x'} />
            <Text {...controlsMedium} fontSize='16px'>
              {data[2].displayName
                ? cutUsername(data[2].displayName, 17)
                : truncateEthAddress(data[2].account)}
            </Text>
          </HStack>
          <LeaderboardThird />
        </Box>
      )}
    </HStack>
  )
}
