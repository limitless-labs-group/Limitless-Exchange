'use client'

import { MainLayout, MarketCard, MarketCardMobile } from '@/components'
import { defaultChain } from '@/constants'
import { useIsMobile } from '@/hooks'
import { OpenEvent, PageOpenedMetadata, useAmplitude, useCategories } from '@/services'
import { Divider, VStack, Text, Box, Spinner, HStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import SortFilter from '@/components/common/sort-filter'
import { Market, Sort } from '@/types'
import { formatUnits, getAddress } from 'viem'
import { useMarkets } from '@/services/MarketsService'
import InfiniteScroll from 'react-infinite-scroll-component'
import { usePriceOracle } from '@/providers'
import TextWithPixels from '@/components/common/text-with-pixels'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useSearchParams } from 'next/navigation'

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

  const markets: Market[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || []
  }, [data?.pages, category])

  //it helps to get integer value form solidity representation
  const formatMarketNumber = (market: Market, amount: string | undefined) => {
    return convertTokenAmountToUsd(
      market.tokenTicker[defaultChain.id],
      formatUnits(BigInt(amount ?? 0), market.tokenTicker[defaultChain.id] === 'USDC' ? 6 : 18)
    )
  }

  const filteredMarkets = useMemo(() => {
    const tokenFilteredMarkets = markets?.filter((market) =>
      selectedFilterTokens.length > 0
        ? selectedFilterTokens.some(
            (filterToken) =>
              getAddress(filterToken.address) ===
              getAddress(market.collateralToken[defaultChain.id])
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
        return [...filteredMarkets].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case Sort.HIGHEST_VOLUME:
        return [...filteredMarkets].sort(
          (a, b) => formatMarketNumber(b, b.volume) - formatMarketNumber(a, a.volume)
        )
      case Sort.HIGHEST_LIQUIDITY:
        return [...filteredMarkets].sort(
          (a, b) => formatMarketNumber(b, b.liquidity) - formatMarketNumber(a, a.liquidity)
        )
      case Sort.ENDING_SOON:
        return [...filteredMarkets].sort(
          (a, b) =>
            new Date(a.expirationTimestamp).getTime() - new Date(b.expirationTimestamp).getTime()
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
                {sortedMarkets?.map((market) =>
                  isMobile ? (
                    <MarketCardMobile key={uuidv4()} market={market} />
                  ) : (
                    <MarketCard key={uuidv4()} market={market} />
                  )
                )}
              </VStack>
            </VStack>
          </InfiniteScroll>
        )}
      </Box>
    </MainLayout>
  )
}

export default MainPage
