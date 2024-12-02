import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import Carousel from '@/components/common/carousel/carousel-mobile/carousel'
import { controlsMedium } from '@/styles/fonts/fonts.styles'

export default function LeadersMobile() {
  const slides = [
    <VStack h='132px' key={1} w='full' justifyContent='end' gap={0}>
      <HStack gap='4px' justifyContent='center' marginBottom='-8px'>
        <Avatar account='asd' />
        <Text {...controlsMedium} fontSize='16px'>
          Habibi
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
        <Avatar account='asd' />
        <Text {...controlsMedium} fontSize='16px'>
          Habibi
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
        <Avatar account='asd' />
        <Text {...controlsMedium} fontSize='16px'>
          Habibi
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
