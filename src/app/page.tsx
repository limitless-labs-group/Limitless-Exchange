'use client'

import { MainLayout } from '@/components'
import { useIsMobile } from '@/hooks'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useCategories } from '@/services'
import { Divider, VStack, Text, Box, Spinner, HStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import SortFilter from '@/components/common/sort-filter'
import { Market, MarketGroupCardResponse, MarketSingleCardResponse, Sort } from '@/types'
import { getAddress } from 'viem'
import { useMarkets } from '@/services/MarketsService'
import InfiniteScroll from 'react-infinite-scroll-component'
import { usePriceOracle } from '@/providers'
import TextWithPixels from '@/components/common/text-with-pixels'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useSearchParams } from 'next/navigation'
import { MarketSingleCard, MarketGroupCard } from 'src/components/common/markets/market-cards'
import DailyMarketsSection from '@/components/common/markets/daily-markets'
import AllMarkets from '@/components/common/markets/all-markets'

const MainPage = () => {
  const searchParams = useSearchParams()
  const { data: categories } = useCategories()
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  const category = searchParams.get('category')

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

  const dataLength = data?.pages.reduce((counter, page) => {
    return counter + page.data.length
  }, 0)

  const markets: (MarketGroupCardResponse | MarketSingleCardResponse)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || []
  }, [data?.pages, category])

  const filteredMarkets = useMemo(() => {
    const tokenFilteredMarkets = markets?.filter((market) =>
      selectedFilterTokens.length > 0
        ? selectedFilterTokens.some(
            (filterToken) =>
              getAddress(filterToken.address) === getAddress(market.collateralToken.address)
          )
        : true
    )

    if (selectedCategory) {
      return tokenFilteredMarkets.filter((market) => market.category === selectedCategory?.name)
    }

    return tokenFilteredMarkets
  }, [markets, selectedFilterTokens, selectedCategory])

  const dailyMarkets = filteredMarkets.filter(
    // @ts-ignore
    (market) => market.title.includes('space') && !market.slug
  ) as unknown as MarketSingleCardResponse[]

  const allMarkets = filteredMarkets.filter((market) => !market.title.includes('space'))

  const sortedMarkets = useMemo(() => {
    if (!allMarkets) return []
    switch (selectedSort) {
      case Sort.NEWEST:
        return [...allMarkets].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      case Sort.HIGHEST_VOLUME:
        return [...allMarkets].sort((a, b) => {
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
        return [...allMarkets].sort((a, b) => {
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
        return [...allMarkets].sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
      default:
        return allMarkets
    }
  }, [markets, allMarkets, selectedSort])

  return (
    <MainLayout layoutPadding={isMobile ? '0' : '16px'}>
      <Box w={isMobile ? 'full' : '664px'}>
        {isFetching && !isFetchingNextPage ? (
          <HStack w={'full'} justifyContent={'center'} alignItems={'center'}>
            <Spinner />
          </HStack>
        ) : (
          <>
            <DailyMarketsSection markets={dailyMarkets} />
            <AllMarkets
              dataLength={dataLength ?? 0}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              markets={sortedMarkets}
              handleSelectSort={handleSelectSort}
            />
          </>
        )}
      </Box>
    </MainLayout>
  )
}

export default MainPage
