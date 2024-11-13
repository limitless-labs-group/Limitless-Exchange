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
import { Category, Market, MarketGroup, Sort } from '@/types'

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
      onOpenMarketPage(marketData, 'Standard Banner')
      return
    }
    if (marketGroupData) {
      onOpenMarketPage(marketGroupData, 'Standard Banner')
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

  const [selectedSort, setSelectedSort] = useState<Sort>(
    (window.localStorage.getItem('SORT') as Sort) ?? Sort.BASE
  )
  const handleSelectSort = (options: Sort) => {
    window.localStorage.setItem('SORT', options)
    setSelectedSort(options)
  }

  const { selectedFilterTokens, selectedCategory } = useTokenFilter()

  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useMarkets(categoryEntity)

  const { data: dailyMarkets, isLoading: isLoadingDailyMarkets } = useDailyMarkets(categoryEntity)

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
    const tokenFilteredMarkets = markets?.filter((market) =>
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
  }, [markets, selectedFilterTokens, selectedCategory])

  const sortedMarkets = useMemo(() => {
    if (!filteredAllMarkets) return []
    switch (selectedSort) {
      case Sort.NEWEST:
        return [...filteredAllMarkets].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      case Sort.HIGHEST_VOLUME:
        return [...filteredAllMarkets].sort((a, b) => {
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
      case Sort.HIGHEST_LIQUIDITY:
        return [...filteredAllMarkets].sort((a, b) => {
          // @ts-ignore
          const liquidityA = a?.slug
            ? // @ts-ignore
              a.markets.reduce((a, b) => a + +b.liquidityFormatted, 0)
            : // @ts-ignore
              +a.liquidityFormatted
          // @ts-ignore
          const liquidityB = b?.slug
            ? // @ts-ignore
              b.markets.reduce((a, b) => a + +b.liquidityFormatted, 0)
            : // @ts-ignore
              +b.liquidityFormatted

          return (
            convertTokenAmountToUsd(b.collateralToken.symbol, liquidityB) -
            convertTokenAmountToUsd(a.collateralToken.symbol, liquidityA)
          )
        })
      case Sort.ENDING_SOON:
        return [...filteredAllMarkets].sort(
          (a, b) =>
            new Date(a.expirationTimestamp).getTime() - new Date(b.expirationTimestamp).getTime()
        )
      default:
        return filteredAllMarkets
    }
  }, [markets, filteredAllMarkets, selectedSort])

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
            <TopMarkets markets={topMarkets as Market[]} isLoading={isLoadingDailyMarkets} />
            <DailyMarketsSection
              markets={
                isMobile
                  ? dailyMarkets?.data.markets
                  : dailyMarkets?.data.markets.slice((page - 1) * 6, page * 6)
              }
              isLoading={isLoadingDailyMarkets}
              totalAmount={dailyMarkets?.data.totalAmount}
              onClickNextPage={() => {
                if (!dailyMarkets) {
                  return
                }
                if (dailyMarkets.data.markets.length < 6) {
                  return
                }
                if (6 * page >= dailyMarkets.data.totalAmount) {
                  return
                }
                setPage(page + 1)
              }}
              onClickPrevPage={() => {
                if (page === 1) {
                  return
                }
                setPage(page - 1)
                return
              }}
              page={page}
            />
            <AllMarkets
              dataLength={dataLength ?? 0}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              markets={sortedMarkets}
              handleSelectSort={handleSelectSort}
              totalAmount={data?.pages?.[0].data.totalAmount}
              isLoading={isFetching && !isFetchingNextPage}
            />
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
