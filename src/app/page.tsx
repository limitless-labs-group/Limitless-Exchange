'use client'

import { CreateMarketCard, MainLayout, MarketCard, MarketCardMobile } from '@/components'
import { defaultChain } from '@/constants'
import { useIsMobile } from '@/hooks'
import { OpenEvent, useAmplitude } from '@/services'
import { Grid, HStack, Stack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Filter from '@/components/common/TokenFilter'
import SortFilter from '@/components/common/SortFilter'
import { Market, Sort, Token } from '@/types'
import { getAddress } from 'viem'
import { useMarkets } from '@/services/MarketsService'
import InfiniteScroll from 'react-infinite-scroll-component'

const MainPage = () => {
  /**
   * ANALYTICS
   */
  const { trackOpened } = useAmplitude()
  useEffect(() => {
    trackOpened(OpenEvent.PageOpened, {
      page: 'Explore Markets',
    })
  }, [])

  /**
   * UI
   */
  const isMobile = useIsMobile()

  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])
  const [selectedSort, setSelectedSort] = useState<Sort>(Sort.BASE)
  const handleSelectFilterTokens = (tokens: Token[]) => setSelectedFilterTokens(tokens)
  const handleSelectSort = (options: Sort) => setSelectedSort(options)

  const { data, fetchNextPage, hasNextPage } = useMarkets()

  const dataLength = data?.pages.reduce((counter, page) => {
    return counter + page.data.length
  }, 0)

  const markets: Market[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || []
  }, [data?.pages])

  const filteredMarkets = useMemo(() => {
    return markets?.filter((market) =>
      selectedFilterTokens.length > 0
        ? selectedFilterTokens.some(
            (filterToken) =>
              getAddress(filterToken.address) ===
              getAddress(market.collateralToken[defaultChain.id])
          )
        : true
    )
  }, [markets, selectedFilterTokens])

  const sortedMarkets = useMemo(() => {
    if (!filteredMarkets) return []
    switch (selectedSort) {
      case Sort.NEWEST:
        return [...filteredMarkets].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case Sort.HIGHEST_VOLUME:
        return [...filteredMarkets].sort((a, b) => Number(b.volume) - Number(a.volume))
      case Sort.HIGHEST_LIQUIDITY:
        return [...filteredMarkets].sort((a, b) => Number(b.liquidity) - Number(a.liquidity))
      case Sort.COMING_DEADLINE:
        return [...filteredMarkets].sort(
          (a, b) =>
            new Date(a.expirationTimestamp).getTime() - new Date(b.expirationTimestamp).getTime()
        )
      default:
        return filteredMarkets
    }
  }, [filteredMarkets, selectedSort])

  return (
    <InfiniteScroll
      dataLength={dataLength ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={<h4></h4>}
      scrollThreshold={0.1}
      refreshFunction={fetchNextPage}
      pullDownToRefresh
    >
      <MainLayout maxContentWidth={'unset'}>
        <Stack w={'full'} spacing={5} px={{ md: 14 }}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Filter onChange={handleSelectFilterTokens} />
            <SortFilter onChange={handleSelectSort} />
          </Stack>
          <Grid
            templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
            gap={6}
          >
            <CreateMarketCard />
            {sortedMarkets?.map((market) =>
              isMobile ? (
                <MarketCardMobile key={uuidv4()} market={market} />
              ) : (
                <MarketCard key={uuidv4()} market={market} />
              )
            )}
          </Grid>
        </Stack>
      </MainLayout>
    </InfiniteScroll>
  )
}

export default MainPage
