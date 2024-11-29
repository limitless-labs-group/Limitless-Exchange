'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { MainLayout } from '@/components'
import { h1Regular } from '@/styles/fonts/fonts.styles'

export default function LeaderboardPage() {
  return (
    <MainLayout>
      <HStack
        className='w-full'
        alignItems='flex-start'
        w={isMobile ? 'full' : 'calc(100vw - 690px)'}
        justifyContent='center'
      >
        <Box w={isMobile ? 'full' : '664px'}>
          <Text {...h1Regular} textAlign='center'>
            Leaderboard
          </Text>
          <HStack w='full'></HStack>
        </Box>
      </HStack>
    </MainLayout>
  )
}
