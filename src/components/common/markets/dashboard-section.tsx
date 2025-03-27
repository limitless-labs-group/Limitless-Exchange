import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import { DashboardHeader } from './dasboard-header'
import { DashboardGroup, DashboardGroupType } from './dashboard-group'
import { usePriceOracle } from '@/providers'
import { useInfinityDashboard } from '@/services/DashboardService'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'
import Loader from '../loader'
import SortFilter from '../sort-filter'

export enum DashboardTagId {
  MARKET_CRASH = 234,
}

export const dashboardNameToTagId: Record<string, DashboardTagId> = {
  marketcrash: DashboardTagId.MARKET_CRASH,
}

const dashboardConfig: Record<DashboardTagId, Array<{ name: string; type: DashboardGroupType }>> = {
  [DashboardTagId.MARKET_CRASH]: [
    { name: 'Recession', type: DashboardGroupType.Row },
    { name: 'Crypto', type: DashboardGroupType.Featured },
    { name: 'Inflation', type: DashboardGroupType.Compact },
    { name: 'Stocks', type: DashboardGroupType.Row },
    { name: 'Gold', type: DashboardGroupType.Row },
  ],
}

interface DashboardSectionProps {
  handleSelectSort: (option: Sort, name: SortStorageName) => void
  sort: Sort
  dashboardName: string
}

export default function DashboardSection({
  handleSelectSort,
  sort,
  dashboardName,
}: DashboardSectionProps) {
  const { convertTokenAmountToUsd } = usePriceOracle()
  const dashboardTagId = useMemo(() => {
    return dashboardNameToTagId[dashboardName.toLowerCase()]
  }, [dashboardName])

  const {
    data: dashboardData,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfinityDashboard(dashboardTagId)

  const dashboard = dashboardData?.pages.flatMap((page) => page.data.markets)

  const categorizedMarkets = (dashboardConfig[dashboardTagId] || [])
    .map((category) => {
      const categoryMarkets = dashboard?.filter((m) => m?.categories?.includes(category.name)) || []

      const sortedMarkets =
        sort === Sort.DEFAULT
          ? categoryMarkets.sort((a, b) => {
              const priorityA = a?.priorityIndex || 0
              const priorityB = b?.priorityIndex || 0
              return priorityB - priorityA
            })
          : sortMarkets(categoryMarkets, sort, convertTokenAmountToUsd)

      return {
        ...category,
        markets: sortedMarkets,
      }
    })
    .filter((category) => category.markets.length > 0)

  return isLoading ? (
    <Flex width='100%' height='100vh' justifyContent='center' alignItems='center'>
      <Loader />
    </Flex>
  ) : (
    <>
      <DashboardHeader />
      <Box className='full-container'>
        <InfiniteScroll
          className='scroll'
          dataLength={dashboard?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage}
          style={{ width: '100%' }}
          loader={null}
        >
          <Box
            mt='24px'
            mb={isMobile ? '36px' : '40px'}
            w={isMobile ? 'full' : '976px'}
            justifyContent='center'
          >
            <Box px={isMobile ? '16px' : 0}>
              <Divider orientation='horizontal' />
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
              {categorizedMarkets.map((category, index) => (
                <DashboardGroup
                  key={category.name}
                  marketIndex={index}
                  type={isMobile ? DashboardGroupType.Mobile : category.type}
                  categoryName={category.name}
                  markets={category.markets ?? []}
                />
              ))}
            </VStack>
          </Box>
        </InfiniteScroll>
      </Box>
    </>
  )
}
