'use client'

import { HStack, Text } from '@chakra-ui/react'
import { MainLayout } from '@/components'
import { h1Regular } from '@/styles/fonts/fonts.styles'

export default function LeaderboardPage() {
  return (
    <MainLayout>
      <Text {...h1Regular} textAlign='center'>
        Leaderboard
      </Text>
      <HStack w='full'></HStack>
    </MainLayout>
  )
}
