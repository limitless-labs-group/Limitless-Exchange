'use client'

import { HStack, Text, VStack, Box, Heading, Flex } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Chat from '@/components/chat'
import Loader from '@/components/common/loader'
import MarketsSection from '@/components/common/markets/markets-section'
import { sortAtom } from '@/atoms/market-sort'
import { MainLayout } from '@/components'
import { useUrlParams } from '@/hooks/use-url-param'
import { useTradingService } from '@/services'
import { useMarket, useActiveMarkets } from '@/services/MarketsService'
import { h3Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketType, Sort, SortStorageName } from '@/types'
import { getSortValue } from '@/utils/market-sorting'

export interface CategoryMarketsPageProps {
  categoryId: number
  categoryName?: string
}

const CategoryMarketsPage = ({ categoryId, categoryName }: CategoryMarketsPageProps) => {
  const { getParam } = useUrlParams()
  const market = getParam('market')

  const {
    onCloseMarketPage,
    onOpenMarketPage,
    market: selectedMarket,
    groupMarket,
  } = useTradingService()
  const { data: marketData } = useMarket(market ?? undefined)
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useActiveMarkets({
    categoryId,
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

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: Market[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  return (
    <MainLayout layoutPadding={'0px'}>
      <VStack w='full' spacing={0} height={'100%'}>
        <HStack
          className='w-full'
          alignItems='flex-start'
          w='full'
          maxW='1400px'
          justifyContent='space-between'
          spacing={4}
          mt='20px'
        >
          <Box
            className='full-container'
            w='65%'
            h='calc(100vh - 68px)'
            overflowY='auto'
            id='marketsScrollContainer'
          >
            <InfiniteScroll
              className='scroll'
              dataLength={markets?.length ?? 0}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollableTarget='marketsScrollContainer'
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
                categoryName={categoryName}
                withChat
              />
            </InfiniteScroll>
          </Box>
          <Box w='35%' h='calc(100vh - 150px)' position='relative'>
            <Box mt='24px' h='40px'>
              <Text {...h3Medium} alignItems='center' display='flex' h='full'>
                Chat
              </Text>
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
      </VStack>
    </MainLayout>
  )
}

export default CategoryMarketsPage
