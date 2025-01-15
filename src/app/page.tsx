'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getAddress } from 'viem'
import Loader from '@/components/common/loader'
import DailyMarketsSection from '@/components/common/markets/daily-markets'
import TopMarkets from '@/components/common/markets/top-markets'
import { MainLayout } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useIsMobile } from '@/hooks'
import useMarketGroup from '@/hooks/use-market-group'
import { usePriceOracle } from '@/providers'
import {
  OpenEvent,
  PageOpenedMetadata,
  useAmplitude,
  useCategories,
  useTradingService,
} from '@/services'
import { useBanneredMarkets, useMarket, useMarkets } from '@/services/MarketsService'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Category, Market, MarketGroup, Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'

const MainPage = () => {
  const searchParams = useSearchParams()
  const { data: categories } = useCategories()
  const { onCloseMarketPage, onOpenMarketPage } = useTradingService()
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  const category = searchParams.get('category')
  const market = searchParams.get('market')
  const slug = searchParams.get('slug')
  const { data: marketData } = useMarket(market ?? undefined)
  const { data: marketGroupData } = useMarketGroup(slug ?? undefined)

  useEffect(() => {
    if (marketData) {
      onOpenMarketPage(marketData)

      return
    }
    if (marketGroupData) {
      onOpenMarketPage(marketGroupData)
    }
  }, [marketData, marketGroupData])

  useEffect(() => {
    const analyticData: PageOpenedMetadata = {
      page: 'Explore Markets',
      ...(category && { category }),
    }

    trackOpened(OpenEvent.PageOpened, analyticData)
  }, [])

  const categoryEntity = useMemo(() => {
    return (
      categories?.find(
        (categoryEntity) => categoryEntity.name.toLowerCase() === category?.toLowerCase()
      ) || null
    )
  }, [categories, category])

  /**
   * UI
   */
  const isMobile = useIsMobile()

  const [selectedSort, setSelectedSort] = useState<Sort>(() => {
    if (typeof window !== 'undefined') {
      return (window.localStorage.getItem(SortStorageName.SORT) as Sort) ?? Sort.BASE
    }
    return Sort.BASE
  })

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, options)
    setSelectedSort(options)
  }

  const { data: banneredMarkets, isFetching: isBanneredLoading } =
    useBanneredMarkets(categoryEntity)

  const { selectedFilterTokens, selectedCategory } = useTokenFilter()

  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useMarkets(categoryEntity)

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages, category])

  const filteredAllMarkets = useMemo(() => {
    if (!markets) return []

    const tokenFilteredMarkets = markets.filter((market) =>
      selectedFilterTokens.length > 0
        ? selectedFilterTokens.some(
            (filterToken) =>
              getAddress(filterToken.address) === getAddress(market.collateralToken.address)
          )
        : true
    )

    if (selectedCategory) {
      return tokenFilteredMarkets.filter(
        (market) => (market.category as Category).name === selectedCategory?.name
      )
    }

    return tokenFilteredMarkets
  }, [markets])

  const sortedAllMarkets = useMemo(() => {
    return sortMarkets(filteredAllMarkets, selectedSort, convertTokenAmountToUsd)
  }, [filteredAllMarkets, selectedSort, convertTokenAmountToUsd])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  return (
    <MainLayout layoutPadding={'0px'}>
      <HStack
        className='w-full'
        alignItems='flex-start'
        w={isMobile ? 'full' : 'calc(100vw - 690px)'}
        justifyContent='center'
      >
        <Box w={isMobile ? 'full' : '664px'}>
          <>
            {banneredMarkets && banneredMarkets.length > 0 ? (
              <TopMarkets markets={banneredMarkets as Market[]} isLoading={isBanneredLoading} />
            ) : null}
            <InfiniteScroll
              className='scroll'
              dataLength={sortedAllMarkets?.length ?? 0}
              next={fetchNextPage}
              hasMore={hasNextPage}
              style={{ width: '100%' }}
              loader={
                sortedAllMarkets.length > 0 && sortedAllMarkets.length < totalAmount ? (
                  <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
                    <Loader />
                    <Text {...paragraphRegular}>Loading more markets</Text>
                  </HStack>
                ) : null
              }
            >
              <DailyMarketsSection
                markets={sortedAllMarkets as Market[]}
                handleSelectSort={handleSelectSort}
                totalAmount={data?.pages?.[0].data.totalAmount}
                isLoading={isFetching && !isFetchingNextPage}
              />
            </InfiniteScroll>
          </>
        </Box>
      </HStack>
    </MainLayout>
  )
}

export default MainPage
