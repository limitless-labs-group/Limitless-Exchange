'use client'

import { Link, HStack, Text, VStack, Box } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import { DashboardHeader } from '@/components/common/markets/dasboard-header'
import DashboardSection from '@/components/common/markets/dashboard-section'
import { MarketCategoryHeader } from '@/components/common/markets/market-category-header'
import MarketsSection from '@/components/common/markets/markets-section'
import { CategoryItems, SideItem } from '@/components/common/markets/sidebar-item'
import TopMarkets from '@/components/common/markets/top-markets'
import { sortAtom } from '@/atoms/market-sort'
import { MainLayout } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import useMarketGroup from '@/hooks/use-market-group'
import usePageName from '@/hooks/use-page-name'
import { usePriceOracle } from '@/providers'
import GridIcon from '@/resources/icons/sidebar/Markets.svg'
import DashboardIcon from '@/resources/icons/sidebar/dashboard.svg'
import {
  ClickEvent,
  OpenEvent,
  PageOpenedMetadata,
  ProfileBurgerMenuClickedMetadata,
  useAmplitude,
  useCategories,
  useTradingService,
} from '@/services'
import { useBanneredMarkets, useMarket, useMarkets } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Dashboard, Market, MarketGroup, Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'

const MainPage = () => {
  const searchParams = useSearchParams()
  const { data: categories } = useCategories()
  const { onCloseMarketPage, onOpenMarketPage } = useTradingService()
  const { trackClicked, trackOpened } = useAmplitude()
  const category = searchParams.get('category')
  const market = searchParams.get('market')
  const slug = searchParams.get('slug')
  const dashboardSearch = searchParams.get('dashboard')
  const { data: marketData } = useMarket(market ?? undefined)
  const { data: marketGroupData } = useMarketGroup(slug ?? undefined)

  const pageName = usePageName()

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
      ...(category && { category: [category] }),
    }

    trackOpened(OpenEvent.PageOpened, analyticData)
  }, [])

  const [selectedSort, setSelectedSort] = useAtom(sortAtom)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSort = window.localStorage.getItem(SortStorageName.SORT)
      if (storedSort) {
        try {
          const parsedSort = JSON.parse(storedSort) as Sort
          setSelectedSort({ sort: parsedSort })
        } catch (error) {
          console.error('Error parsing stored sort:', error)
          setSelectedSort({ sort: Sort.BASE })
        }
      }
    }
  }, [])

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, JSON.stringify(options))
    setSelectedSort({ sort: options ?? Sort.BASE })
  }

  const { data: banneredMarkets, isFetching: isBanneredLoading } = useBanneredMarkets(null)

  const { selectedCategory, handleCategory, dashboard, handleDashboard } = useTokenFilter()

  useEffect(() => {
    if (category && categories) {
      const categoryFromUrl = categories.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
      )
      if (categoryFromUrl) {
        handleCategory(categoryFromUrl)
      }
    }
  }, [category, categories])

  useEffect(() => {
    if (dashboardSearch) {
      handleDashboard(dashboardSearch as Dashboard)
    }
  }, [dashboardSearch])

  const { convertTokenAmountToUsd } = usePriceOracle()

  // pass categoryEntity to useMarket to make call with category
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useMarkets(null)

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages, category])

  const filteredAllMarkets = useMemo(() => {
    if (!markets) return []
    if (!selectedCategory) return markets
    if (selectedCategory) {
      setSelectedSort({ sort: Sort.BASE })
      window.localStorage.setItem(SortStorageName.SORT, JSON.stringify(Sort.BASE))
      return markets.filter((market) =>
        market.categories.some(
          (category) => category.toLowerCase() === selectedCategory.name.toLowerCase()
        )
      )
    }

    return markets
  }, [markets, selectedCategory])

  const sortedAllMarkets = useMemo(() => {
    return sortMarkets(filteredAllMarkets, selectedSort?.sort || Sort.BASE, convertTokenAmountToUsd)
  }, [filteredAllMarkets, selectedSort, convertTokenAmountToUsd])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  const headerContent = useMemo(() => {
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
          <MarketCategoryHeader name={selectedCategory.name} />
        </Box>
      )
    }
    if (dashboard) {
      return <DashboardHeader />
    }
    return <TopMarkets markets={banneredMarkets as Market[]} isLoading={isBanneredLoading} />
  }, [selectedCategory, dashboard, banneredMarkets, isBanneredLoading])

  return (
    <MainLayout layoutPadding={'0px'}>
      <HStack className='w-full' alignItems='flex-start' w='full' justifyContent='center'>
        <VStack w='full' justifyContent='center'>
          <>
            {isMobile ? (
              <HStack
                gap='0px'
                px='8px'
                pb='8px'
                overflowX='auto'
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none',
                  '-ms-overflow-style': 'none',
                }}
                minW='100%'
                w='full'
              >
                <NextLink
                  href='/'
                  passHref
                  style={{
                    width: isMobile ? 'fit-content' : '100%',
                    textDecoration: 'none',
                  }}
                >
                  <Link
                    onClick={() => {
                      trackClicked<ProfileBurgerMenuClickedMetadata>(
                        ClickEvent.ProfileBurgerMenuClicked,
                        {
                          option: 'Markets',
                        }
                      )
                      handleCategory(undefined)
                      handleDashboard(undefined)
                      setSelectedSort({ sort: Sort.BASE })
                    }}
                    variant='transparent'
                    w='full'
                    h='24px'
                    textDecoration='none'
                    _active={{ textDecoration: 'none' }}
                    _hover={{ textDecoration: 'none' }}
                    bg={
                      pageName === 'Explore Markets' && !selectedCategory && !dashboard
                        ? 'grey.100'
                        : 'unset'
                    }
                    rounded='8px'
                  >
                    <HStack w='full' whiteSpace='nowrap'>
                      <GridIcon width={16} height={16} />
                      <Text {...paragraphMedium} fontWeight={500}>
                        {`All markets ${isFetching ? '' : `(${totalAmount})`} `}
                      </Text>
                    </HStack>
                  </Link>
                </NextLink>

                {!isFetching ? (
                  <NextLink
                    href={`/?dashboard=marketcrash`}
                    passHref
                    style={{ width: isMobile ? 'fit-content' : '100%' }}
                  >
                    <Link>
                      <SideItem
                        isActive={dashboard === 'marketcrash'}
                        icon={<DashboardIcon width={16} height={16} color='#FF9200' />}
                        onClick={() => {
                          handleDashboard('marketcrash')
                        }}
                        color='orange-500'
                      >
                        Market crash
                      </SideItem>
                    </Link>
                  </NextLink>
                ) : null}

                <CategoryItems />
              </HStack>
            ) : null}

            {headerContent}
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
              {dashboard ? (
                <DashboardSection
                  markets={sortedAllMarkets as Market[]}
                  handleSelectSort={handleSelectSort}
                  isLoading={isFetching && !isFetchingNextPage}
                  sort={selectedSort.sort}
                />
              ) : (
                <MarketsSection
                  markets={sortedAllMarkets as Market[]}
                  handleSelectSort={handleSelectSort}
                  isLoading={isFetching && !isFetchingNextPage}
                  sort={selectedSort.sort}
                />
              )}
            </InfiniteScroll>
          </>
        </VStack>
      </HStack>
    </MainLayout>
  )
}

export default MainPage
