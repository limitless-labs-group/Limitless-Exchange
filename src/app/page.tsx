'use client'

import {
  HStack,
  Text,
  VStack,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import React, { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Chat from '@/components/chat'
import Loader from '@/components/common/loader'
import { MarketCategoryHeader } from '@/components/common/markets/market-category-header'
import MarketsSection from '@/components/common/markets/markets-section'
import TopMarkets from '@/components/common/markets/top-markets'
import CategoriesDesktop from '@/components/layouts/categories-desktop'
import { sortAtom } from '@/atoms/market-sort'
import { MainLayout } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useUrlParams } from '@/hooks/use-url-param'
import {
  OpenEvent,
  PageOpenedMetadata,
  DashboardName,
  useAmplitude,
  useTradingService,
} from '@/services'
import { useBanneredMarkets, useMarket, useSortedMarkets } from '@/services/MarketsService'
import { h3Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Dashboard, Market, MarketType, Sort, SortStorageName } from '@/types'
import { getSortValue } from '@/utils/market-sorting'

const MainPage = () => {
  const { getParam } = useUrlParams()
  const market = getParam('market')
  const dashboardSearch = getParam('dashboard')

  const {
    onCloseMarketPage,
    onOpenMarketPage,
    market: selectedMarket,
    groupMarket,
  } = useTradingService()
  const { trackOpened } = useAmplitude()
  const { data: marketData } = useMarket(market ?? undefined)
  const { data: banneredMarkets, isFetching: isBanneredLoading } = useBanneredMarkets(null)
  const { selectedCategory, dashboard, handleDashboard } = useTokenFilter()
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useSortedMarkets({
    categoryId: selectedCategory?.id,
    sortBy: getSortValue(selectedSort.sort),
  })

  useEffect(() => {
    if (marketData) {
      if (
        marketData.marketType === ('single' as MarketType) &&
        selectedMarket?.slug !== marketData.slug
      ) {
        onOpenMarketPage(marketData)
        return
      }
      if (
        marketData.marketType === ('group' as MarketType) &&
        groupMarket?.slug !== marketData.slug
      ) {
        onOpenMarketPage(marketData)
        return
      }
    }
  }, [marketData])

  useEffect(() => {
    const dashboardNameMapping: Record<string, string> = {
      marketwatch: DashboardName.MarketWatch,
    }

    const analyticData: PageOpenedMetadata = {
      page: 'Explore Markets',
      ...(selectedCategory && { category: [selectedCategory.name.toLowerCase()] }),
      ...(dashboard && { dashboard: dashboardNameMapping[dashboard.toLowerCase()] || dashboard }),
    }
    trackOpened(OpenEvent.PageOpened, analyticData)
  }, [selectedCategory?.name, dashboard])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSort = window.localStorage.getItem(SortStorageName.SORT)
      if (storedSort) {
        try {
          const parsedSort = JSON.parse(storedSort) as Sort
          setSelectedSort({ sort: parsedSort })
        } catch (error) {
          console.error('Error parsing stored sort:', error)
          setSelectedSort({ sort: Sort.DEFAULT })
        }
      }
    }
  }, [])

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, JSON.stringify(options))
    setSelectedSort({ sort: options ?? Sort.DEFAULT })
  }

  useEffect(() => {
    if (dashboardSearch) {
      handleDashboard(dashboardSearch as Dashboard)
    }
  }, [dashboardSearch])

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: Market[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  const headerContent = useMemo(() => {
    if (selectedCategory?.name === 'Crypto') return
    if (selectedCategory) {
      return (
        <Box
          w='full'
          overflowX='scroll'
          css={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <MarketCategoryHeader
            name={selectedCategory.name}
            withChat={selectedCategory.name === 'Crypto' && !isMobile}
          />
        </Box>
      )
    }
    return <TopMarkets markets={banneredMarkets as Market[]} isLoading={isBanneredLoading} />
  }, [selectedCategory, banneredMarkets, isBanneredLoading])

  const header = (
    <HStack py='4px' px='12px' bg='grey.50' gap={0} pt='4px' mb='12px'>
      <CategoriesDesktop />
    </HStack>
  )

  return (
    <MainLayout layoutPadding={'0px'} headerComponent={header}>
      <VStack w='full' spacing={0}>
        {headerContent}

        {selectedCategory?.name === 'Crypto' && !isMobile ? (
          false ? (
            <Box w='full' maxW='2100px' h='calc(100vh - 250px)'>
              <Tabs position='relative' variant='common'>
                <TabList>
                  <Tab>Chat</Tab>
                  <Tab>Markets</Tab>
                </TabList>
                <TabIndicator
                  mt='-2px'
                  height='2px'
                  bg='grey.800'
                  transitionDuration='200ms !important'
                />
                <TabPanels>
                  <TabPanel>
                    <Box w='full' h='full' position='relative' p={4}>
                      <Box
                        w='full'
                        borderRadius='md'
                        h='full'
                        overflow='hidden'
                        display='flex'
                        flexDirection='column'
                      >
                        <Chat />
                      </Box>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box className='full-container' w='full' h='full' overflowY='auto'>
                      <InfiniteScroll
                        className='scroll'
                        dataLength={markets?.length ?? 0}
                        next={fetchNextPage}
                        hasMore={hasNextPage}
                        style={{ width: '100%', height: '100%' }}
                        loader={
                          markets.length > 0 && markets.length < totalAmount ? (
                            <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
                              <Loader />
                              <Text {...paragraphRegular}>Loading more markets</Text>
                            </HStack>
                          ) : null
                        }
                      >
                        <MarketsSection
                          markets={markets as Market[]}
                          handleSelectSort={handleSelectSort}
                          isLoading={isFetching && !isFetchingNextPage}
                          sort={selectedSort.sort}
                          withChat
                        />
                      </InfiniteScroll>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          ) : (
            <HStack
              className='w-full'
              alignItems='flex-start'
              w='full'
              maxW='1400px'
              justifyContent='space-between'
              spacing={4}
              h='calc(100vh - 250px)'
            >
              <Box className='full-container' w='65%' h='full' overflowY='auto'>
                <InfiniteScroll
                  className='scroll'
                  dataLength={markets?.length ?? 0}
                  next={fetchNextPage}
                  hasMore={hasNextPage}
                  style={{ width: '100%', height: '100%' }}
                  loader={
                    markets.length > 0 && markets.length < totalAmount ? (
                      <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
                        <Loader />
                        <Text {...paragraphRegular}>Loading more markets</Text>
                      </HStack>
                    ) : null
                  }
                >
                  <MarketsSection
                    markets={markets as Market[]}
                    handleSelectSort={handleSelectSort}
                    isLoading={isFetching && !isFetchingNextPage}
                    sort={selectedSort.sort}
                    withChat
                  />
                </InfiniteScroll>
              </Box>
              <Box w='35%' h='full' position='relative'>
                <Box mt='24px'>
                  <Text {...h3Medium}>Chat</Text>
                </Box>
                <Box
                  w='full'
                  borderRadius='md'
                  h='full'
                  overflow='hidden'
                  display='flex'
                  flexDirection='column'
                >
                  <Chat />
                </Box>
              </Box>
            </HStack>
          )
        ) : (
          <Box className='full-container' w={isMobile ? 'full' : 'unset'}>
            <InfiniteScroll
              className='scroll'
              dataLength={markets?.length ?? 0}
              next={fetchNextPage}
              hasMore={hasNextPage}
              style={{ width: '100%' }}
              loader={
                markets.length > 0 && markets.length < totalAmount ? (
                  <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
                    <Loader />
                    <Text {...paragraphRegular}>Loading more markets</Text>
                  </HStack>
                ) : null
              }
            >
              <MarketsSection
                markets={markets as Market[]}
                handleSelectSort={handleSelectSort}
                isLoading={isFetching && !isFetchingNextPage}
                sort={selectedSort.sort}
              />
            </InfiniteScroll>
          </Box>
        )}
      </VStack>
    </MainLayout>
  )
}

export default MainPage
