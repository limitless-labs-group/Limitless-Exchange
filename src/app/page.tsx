'use client'

import { MainLayout } from '@/components'
import { useIsMobile } from '@/hooks'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useCategories } from '@/services'
import { Divider, VStack, Text, Box, Spinner, HStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import SortFilter from '@/components/common/sort-filter'
import { Market, MarketGroupCardResponse, MarketSingleCardResponse, Sort } from '@/types'
import { formatUnits, getAddress } from 'viem'
import { useMarkets } from '@/services/MarketsService'
import InfiniteScroll from 'react-infinite-scroll-component'
import { usePriceOracle } from '@/providers'
import TextWithPixels from '@/components/common/text-with-pixels'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useSearchParams } from 'next/navigation'
import { MarketSingleCard, MarketGroupCard } from '@/components/common/market-cards'

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

  const [selectedSort, setSelectedSort] = useState<Sort>(Sort.BASE)
  const handleSelectSort = (options: Sort) => setSelectedSort(options)

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

  //it helps to get integer value form solidity representation
  const formatMarketNumber = (market: Market, amount: string | undefined) => {
    return convertTokenAmountToUsd(
      market.collateralToken.symbol,
      formatUnits(BigInt(amount ?? 0), market.collateralToken.decimals)
    )
  }

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

  const sortedMarkets = useMemo(() => {
    if (!filteredMarkets) return []
    switch (selectedSort) {
      case Sort.NEWEST:
        return [...filteredMarkets].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      case Sort.HIGHEST_VOLUME:
        return [...filteredMarkets].sort((a, b) => {
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
        return [...filteredMarkets].sort((a, b) => {
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
        return [...filteredMarkets].sort(
          (a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
        )
      default:
        return filteredMarkets
    }
  }, [markets, filteredMarkets, selectedSort])

  return (
    <MainLayout>
      <Box w={isMobile ? 'full' : '664px'} ml={isMobile ? 'auto' : '200px'}>
        <Divider bg='grey.800' orientation='horizontal' h='3px' mb='16px' />
        <TextWithPixels
          text={`Explore ${categoryEntity?.name ?? 'Limitless'} Prediction Markets`}
          fontSize={'32px'}
          gap={2}
          userSelect='text'
        />
        <Text color='grey.800' fontSize={'14px'} userSelect='text'>
          Predict outcomes in crypto, tech, sports, and more. Use different tokens, participate in
          transparent voting for upcoming markets, and engage in markets created by the community.
          It’s all decentralized and secure.
        </Text>

        <SortFilter onChange={handleSelectSort} />
        {isFetching && !isFetchingNextPage ? (
          <HStack w={'full'} justifyContent={'center'} alignItems={'center'}>
            <Spinner />
          </HStack>
        ) : (
          <InfiniteScroll
            dataLength={dataLength ?? 0}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<h4></h4>}
            scrollThreshold={0.1}
            refreshFunction={fetchNextPage}
            pullDownToRefresh
          >
            <VStack w={'full'} spacing={5}>
              <VStack gap={2} w='full'>
                {sortedMarkets?.map((market) => {
                  // @ts-ignore
                  return market.slug ? (
                    <MarketGroupCard marketGroup={market as MarketGroupCardResponse} />
                  ) : (
                    <MarketSingleCard market={market as MarketSingleCardResponse} />
                  )
                })}
              </VStack>
            </VStack>
          </InfiniteScroll>
        )}
      </Box>
    </MainLayout>
  )
}

export default MainPage
