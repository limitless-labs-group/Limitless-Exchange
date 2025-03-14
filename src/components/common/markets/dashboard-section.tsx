import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { DashboardGroup } from './dashboard-group'
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
    { name: 'Crypto', type: 'featured' },
    { name: 'Inflation', type: 'compact' },
    { name: 'Stocks', type: 'row' },
    { name: 'Gold', type: 'row' },
    // { name: 'Trade wars', type: 'row' },
    // { name: 'Forex', type: 'grid' },
  ]

  const categorizedMarkets = categoryConfig
    .map((category) => ({
      ...category,
      markets: markets?.filter((m) => m.categories.includes(category.name)) || [],
    }))
    .filter((category) => category.markets.length > 0)

  return isMobile ? (
    <Box mt='24px' mb='36px' w='full' justifyContent='center'>
      <Box
        mt='24px'
        mx='16px'
        p='16px'
        borderRadius='12px'
        bg='primary.50'
        border='1px solid'
        borderColor='primary.100'
      >
        <Flex direction='column' align='center'>
          <Text fontWeight='600' fontSize='18px' color='primary.700' textAlign='center' mb='8px'>
            Enhanced Market Dashboard Available
          </Text>
          <Text fontSize='14px' color='grey.700' textAlign='center' mb='16px'>
            For the full crash market dashboard with advanced charts and detailed analytics, visit
            Limitless Exchange on your desktop browser.
          </Text>
        </Flex>
      </Box>
    </Box>
  ) : (
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
