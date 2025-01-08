'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getAddress } from 'viem'
import AllMarkets from '@/components/common/markets/all-markets'
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
import { useDailyMarkets, useMarket, useMarkets } from '@/services/MarketsService'
import { Category, Market, MarketGroup, Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'

const MainPage = () => {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
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

  const [selectedSortDaily, setSelectedSortDaily] = useState<Sort>(() => {
    if (typeof window !== 'undefined') {
      return (window.localStorage.getItem(SortStorageName.SORT_DAILY) as Sort) ?? Sort.BASE
    }
    return Sort.BASE
  })

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, options)
    if (name === SortStorageName.SORT) {
      setSelectedSort(options)
      return
    }
    setSelectedSortDaily(options)
  }

  const { selectedFilterTokens, selectedCategory } = useTokenFilter()

  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useMarkets(categoryEntity)

  const { data: dailyMarkets, isLoading: isLoadingDailyMarkets } = useDailyMarkets(categoryEntity)

  const isBannered = dailyMarkets?.data.markets.filter((market) => market.isBannered)

  const topMarkets =
    dailyMarkets?.data.markets
      // @ts-ignore
      .filter((market) => !market.slug)
      .sort((a, b) => {
        // @ts-ignore
        const volumeA = a?.slug
          ? // @ts-ignore
            a.markets.reduce((a, b) => a + +b.volumeFormatted, 0)
          : // @ts-ignore
            +a.volumeFormatted
        // @ts-ignore
        const volumeB = b?.slug
          ? // @ts-ignore
            b.markets.reduce((a, b) => a + +b.volumeFormatted, 0)
          : // @ts-ignore
            +b.volumeFormatted

        return (
          convertTokenAmountToUsd(b.collateralToken.symbol, volumeB) -
          convertTokenAmountToUsd(a.collateralToken.symbol, volumeA)
        )
      })
      .slice(0, 3) || []

  const dataLength = data?.pages.reduce((counter, page) => {
    return counter + page.data.markets.length
  }, 0)

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

  const sortedDailyMarkets = useMemo(() => {
    if (!dailyMarkets?.data.markets) return []
    return sortMarkets(dailyMarkets.data.markets, selectedSortDaily, convertTokenAmountToUsd)
  }, [dailyMarkets?.data.markets, selectedSortDaily, convertTokenAmountToUsd])

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
            <TopMarkets
              markets={isBannered ?? (topMarkets as Market[])}
              isLoading={isLoadingDailyMarkets}
            />
            <DailyMarketsSection
              markets={sortedDailyMarkets}
              handleSelectSort={handleSelectSort}
              isLoading={isLoadingDailyMarkets}
              totalAmount={dailyMarkets?.data.totalAmount}
            />
            {/* <AllMarkets */}
            {/*   markets={sortedAllMarkets} */}
            {/*   handleSelectSort={handleSelectSort} */}
            {/*   totalAmount={data?.pages?.[0].data.totalAmount} */}
            {/*   isLoading={isFetching && !isFetchingNextPage} */}
            {/* /> */}
          </>
          {/*{isFetching && !isFetchingNextPage ? (*/}
          {/*  <HStack w={'full'} justifyContent={'center'} alignItems={'center'}>*/}
          {/*    <Spinner />*/}
          {/*  </HStack>*/}
          {/*) : (*/}
          {/*  */}
          {/*)}*/}
        </Box>
      </HStack>
      {/*{dailyMarkets && <DrawerCarousel markets={dailyMarkets.markets as unknown as Market[]} />}*/}
    </MainLayout>
  )
}

export default MainPage
