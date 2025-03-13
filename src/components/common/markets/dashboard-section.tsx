import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import MarketCardMobile from '@/components/common/markets/market-cards/market-card-mobile'
import Skeleton from '@/components/common/skeleton'
import { DashboardGroup } from './dashboard-group'
import { MarketCard } from './market-cards/market-card'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market, Sort, SortStorageName } from '@/types'
import SortFilter from '../sort-filter'

interface DashboardSectionProps {
  markets?: Market[]
  handleSelectSort: (option: Sort, name: SortStorageName) => void
  isLoading: boolean
}

export default function DashboardSection({
  markets,
  handleSelectSort,
  isLoading,
}: DashboardSectionProps) {
  const categoryConfig = [
    { name: 'Recession', type: 'row' },
    { name: 'Stocks', type: 'row' },
    { name: 'Crypto', type: 'featured' },
    { name: 'Gold', type: 'row' },
    { name: 'Inflation', type: 'row' },
    { name: 'Trade wars', type: 'row' },
    { name: 'Forex', type: 'grid' },
  ]

  const categorizedMarkets = categoryConfig
    .map((category) => ({
      ...category,
      markets: markets?.filter((m) => m.categories.includes(category.name)) || [],
    }))
    .filter((category) => category.markets.length > 0)

  return (
    <Box
      mt='24px'
      mb={isMobile ? '36px' : '40px'}
      w={isMobile ? 'full' : '976px'}
      justifyContent='center'
    >
      <Box px={isMobile ? '16px' : 0}>
        <Divider orientation='horizontal' borderColor='grey.100' />
        <Flex
          alignItems='center'
          justifyContent='space-between'
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Text {...headlineRegular} mt={isMobile ? '8px' : '0px'}>
            All Markets
          </Text>
          <SortFilter onChange={handleSelectSort} storageName={SortStorageName.SORT} />
        </Flex>
      </Box>
      <VStack gap='80px' mt='80px' width='full'>
        {categorizedMarkets.map((category) => (
          <DashboardGroup
            key={category.name}
            type={category.type as 'row' | 'grid'}
            categoryName={category.name}
            markets={category.markets}
          />
        ))}
      </VStack>
    </Box>
  )
}
