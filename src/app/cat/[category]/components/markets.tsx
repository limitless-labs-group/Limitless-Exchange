'use client'

import { HStack, Text, VStack, Box, Heading, Flex } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Chat from '@/components/chat'
import Loader from '@/components/common/loader'
import { MarketCategoryHeader } from '@/components/common/markets/market-category-header'
import MarketsSection from '@/components/common/markets/markets-section'
import { sortAtom } from '@/atoms/market-sort'
import { MainLayout } from '@/components'
import { useUrlParams } from '@/hooks/use-url-param'
import { usePriceOracle } from '@/providers'
import { useTradingService } from '@/services'
import { useMarket, useMarketsByCategory } from '@/services/MarketsService'
import { h3Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketType, Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'

export interface CategoryMarketsPageProps {
  categoryId: number
  categoryName?: string
}

const CategoryMarketsPage = ({ categoryId, categoryName }: CategoryMarketsPageProps) => {
  const { getParam } = useUrlParams()
  const market = getParam('market')
  const withChat = categoryName === 'Crypto'

  const {
    onCloseMarketPage,
    onOpenMarketPage,
    market: selectedMarket,
    groupMarket,
  } = useTradingService()
  const { data: marketData } = useMarket(market ?? undefined)
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)
  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useMarketsByCategory(
    categoryId,
    true
  )

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

  const sortedAllMarkets = useMemo(() => {
    return sortMarkets(markets, selectedSort?.sort || Sort.DEFAULT, convertTokenAmountToUsd)
  }, [markets, selectedSort, convertTokenAmountToUsd])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  return (
    <MainLayout layoutPadding={'0px'}>
      <VStack w='full' mt='80px' spacing={0}>
        {!withChat ? (
          <Flex justifyContent='start' w='full'>
            <MarketCategoryHeader name={categoryName ?? ''} />
          </Flex>
        ) : null}
        {withChat ? (
          <HStack
            className='w-full'
            alignItems='flex-start'
            w='full'
            maxW='1400px'
            justifyContent='space-between'
            spacing={4}
            h='calc(100vh - 250px)'
          >
            <Box className='full-container' w='65%' h='100vh' overflowY='auto'>
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
                  markets={sortedAllMarkets as Market[]}
                  handleSelectSort={handleSelectSort}
                  isLoading={isFetching && !isFetchingNextPage}
                  sort={selectedSort.sort}
                  categoryName={categoryName}
                  withChat
                />
              </InfiniteScroll>
            </Box>
            <Box w='35%' h='calc(100vh - 150px)' position='relative'>
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
        ) : (
          <Box className='full-container' w={isMobile ? 'full' : 'unset'}>
            <InfiniteScroll
              className='scroll'
              dataLength={markets?.length ?? 0}
              next={fetchNextPage}
              hasMore={hasNextPage}
              style={{ width: '100%' }}
              loader={
                markets?.length > 0 && markets?.length < totalAmount ? (
                  <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
                    <Loader />
                    <Text {...paragraphRegular}>Loading more markets</Text>
                  </HStack>
                ) : null
              }
            >
              <MarketsSection
                markets={sortedAllMarkets as Market[]}
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

export default CategoryMarketsPage
