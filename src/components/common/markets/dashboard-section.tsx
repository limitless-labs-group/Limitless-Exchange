import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { DashboardGroup, DashboardGroupType } from './dashboard-group'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Market, Sort, SortStorageName } from '@/types'
import SortFilter from '../sort-filter'

const dashboardConfig = {
  marketCrash: [
    { name: 'Recession', type: DashboardGroupType.Row },
    { name: 'Crypto', type: DashboardGroupType.Featured },
    { name: 'Inflation', type: DashboardGroupType.Compact },
    { name: 'Stocks', type: DashboardGroupType.Row },
    { name: 'Gold', type: DashboardGroupType.Row },
  ],
}

type DashboardType = keyof typeof dashboardConfig

interface DashboardSectionProps {
  markets?: Market[]
  handleSelectSort: (option: Sort, name: SortStorageName) => void
  isLoading: boolean
  sort: Sort
  dashboardType: DashboardType
}

export default function DashboardSection({
  markets,
  handleSelectSort,
  sort,
  dashboardType,
  isLoading,
}: DashboardSectionProps) {
  const categorizedMarkets = dashboardConfig[dashboardType]
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
            Curious what happens next?
          </Text>
          <SortFilter onChange={handleSelectSort} sort={sort} />
        </Flex>
      </Box>
      <VStack gap='80px' mt='80px' width='full' px={isMobile ? '16px' : 'unset'}>
        {categorizedMarkets.map((category) => (
          <DashboardGroup
            key={category.name}
            type={isMobile ? DashboardGroupType.Mobile : category.type}
            categoryName={category.name}
            markets={category.markets}
          />
        ))}
      </VStack>
    </Box>
  )
}
