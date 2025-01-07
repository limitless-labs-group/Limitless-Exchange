import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import Carousel from '@/components/common/carousel/carousel-mobile/carousel'
import { LeaderboardEntity } from '@/hooks/use-leaderboard'
import { controlsMedium } from '@/styles/fonts/fonts.styles'
import { truncateEthAddress } from '@/utils'
import { cutUsername } from '@/utils/string'

interface LeadersProps {
  data?: LeaderboardEntity[]
}

export default function LeadersMobile({ data }: LeadersProps) {
  const slides = [
    <VStack h='132px' key={1} w='full' justifyContent='end' gap={0}>
      <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
        <Avatar account={data?.[1].account || '0x'} avatarUrl={data?.[1].pfpUrl} />
        <Text {...controlsMedium} fontSize='16px'>
          {data?.[1].displayName
            ? cutUsername(data[1].displayName, 20)
            : truncateEthAddress(data?.[1].account)}
        </Text>
      </HStack>
      <img
        src='/assets/images/leaderboard-position-2.svg'
        alt='leaderboard-2'
        style={{
          width: isMobile ? '100%' : 'unset',
        }}
      />
    </VStack>,
    <VStack h='132px' key={2} w='full' justifyContent='end' gap={0}>
      <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
        <Avatar account={data?.[0].account || '0x'} />
        <Text {...controlsMedium} fontSize='16px'>
          {truncateEthAddress(data?.[0].account || '0x')}
        </Text>
      </HStack>
      <img
        src='/assets/images/leaderboard-position-1.svg'
        alt='leaderboard-1'
        style={{
          width: isMobile ? '100%' : 'unset',
        }}
      />
    </VStack>,
    <VStack h='132px' key={3} w='full' justifyContent='end' gap={0}>
      <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
        <Avatar account={data?.[2].account || '0x'} />
        <Text {...controlsMedium} fontSize='16px'>
          {truncateEthAddress(data?.[2].account || '0x')}
        </Text>
      </HStack>
      <img
        src='/assets/images/leaderboard-position-3.svg'
        alt='leaderboard-3'
        style={{
          width: isMobile ? '100%' : 'unset',
        }}
      />
    </VStack>,
  ]
  return (
    <Box my='16px'>
      <Carousel slides={slides} />
    </Box>
  )
}
