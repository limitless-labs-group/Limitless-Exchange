'use client'

import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react'
import { useAtom } from 'jotai/index'
import React from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import SortFilter from '@/components/common/sort-filter'
import { DashboardHeader } from '@/app/market-watch/components/dasboard-header'
import { DashboardGroup, DashboardGroupType } from '@/app/market-watch/components/dashboard-group'
import { sortAtom } from '@/atoms/market-sort'
import { MainLayout } from '@/components'
import { usePriceOracle } from '@/providers'
import { useInfinityDashboard } from '@/services/DashboardService'
import { headlineRegular } from '@/styles/fonts/fonts.styles'
import { Sort, SortStorageName } from '@/types'
import { DashboardTagId } from '@/types/dashboard'
import { sortMarkets } from '@/utils/market-sorting'

const dashboardConfig: Array<{ name: string; type: DashboardGroupType }> = [
  { name: 'Recession', type: DashboardGroupType.Row },
  { name: 'Crypto', type: DashboardGroupType.Featured },
  { name: 'Inflation', type: DashboardGroupType.Compact },
  { name: 'Stocks', type: DashboardGroupType.Row },
  { name: 'Gold', type: DashboardGroupType.Row },
]

export default function MarketWatchPage() {
  const { convertTokenAmountToUsd } = usePriceOracle()
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)

  const {
    data: dashboardData,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfinityDashboard(DashboardTagId.MARKET_WATCH)

  const dashboard = dashboardData?.pages.flatMap((page) => page.data.markets)

  const sort = selectedSort.sort

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, JSON.stringify(options))
    setSelectedSort({ sort: options ?? Sort.DEFAULT })
  }

  const categorizedMarkets = (dashboardConfig || [])
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

  return (
    <MainLayout>
      {isLoading ? (
        <Flex width='100%' height='100vh' justifyContent='center' alignItems='center'>
          <Loader />
        </Flex>
      ) : (
        <Box w={isMobile ? 'full' : '976px'} m='auto'>
          <DashboardHeader />
          <Box mt='24px' mb={isMobile ? '36px' : '40px'} justifyContent='center'>
            <Box>
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
          </Box>
          <Box className='full-container' w={isMobile ? 'full' : 'fit-content'}>
            <InfiniteScroll
              className='scroll'
              dataLength={dashboard?.length ?? 0}
              next={fetchNextPage}
              hasMore={hasNextPage}
              style={{ width: '100%' }}
              loader={null}
            >
              {categorizedMarkets.map((category, index) => (
                <DashboardGroup
                  key={category.name}
                  marketIndex={index}
                  type={isMobile ? DashboardGroupType.Mobile : category.type}
                  categoryName={category.name}
                  markets={category.markets ?? []}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Box>
      )}
    </MainLayout>
  )
}
