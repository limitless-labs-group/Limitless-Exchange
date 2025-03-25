'use client'

import { Link, HStack, Text, VStack, Box } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
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
  DashboardName,
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
  const { data: banneredMarkets, isFetching: isBanneredLoading } = useBanneredMarkets(null)
  const { selectedCategory, handleCategory, dashboard, handleDashboard } = useTokenFilter()
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)
  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useMarkets(null)

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
    const dashboardNameMapping: Record<string, string> = {
      marketcrash: DashboardName.MarketCrash,
    }

    const analyticData: PageOpenedMetadata = {
      page: 'Explore Markets',
      ...(selectedCategory && { category: [selectedCategory.name.toLowerCase()] }),
      ...(dashboard && { dashboard: dashboardNameMapping[dashboard.toLowerCase()] || dashboard }),
    }
    trackOpened(OpenEvent.PageOpened, analyticData)
  }, [selectedCategory, dashboard])

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

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages, category])

  const filteredAllMarkets = useMemo(() => {
    if (!markets) return []
    if (!selectedCategory) return markets
    if (selectedCategory) {
      setSelectedSort({ sort: Sort.DEFAULT })
      window.localStorage.setItem(SortStorageName.SORT, JSON.stringify(Sort.DEFAULT))
      return markets.filter((market) =>
        market.categories.some(
          (category) => category.toLowerCase() === selectedCategory.name.toLowerCase()
        )
      )
    }

    return markets
  }, [markets, selectedCategory])

  const sortedAllMarkets = useMemo(() => {
    return sortMarkets(
      filteredAllMarkets,
      selectedSort?.sort || Sort.DEFAULT,
      convertTokenAmountToUsd
    )
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
    return <TopMarkets markets={banneredMarkets as Market[]} isLoading={isBanneredLoading} />
  }, [selectedCategory, banneredMarkets, isBanneredLoading])

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
                      handleSelectSort(Sort.DEFAULT, SortStorageName.SORT)
                    }}
                    variant='transparent'
                    w='full'
                    h='24px'
                    textDecoration='none'
                    _active={{ textDecoration: 'none' }}
                    _hover={{ textDecoration: 'none' }}
                    bg={
                      pageName === 'Explore Markets' && !selectedCategory && !dashboard
                        ? 'grey.200'
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
                    <Link variant='transparent'>
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

            {dashboard ? (
              <DashboardSection
                dashboardName={dashboard}
                handleSelectSort={handleSelectSort}
                sort={selectedSort.sort}
              />
            ) : (
              <>
                {headerContent}
                <Box className='full-container'>
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
                    <MarketsSection
                      markets={sortedAllMarkets as Market[]}
                      handleSelectSort={handleSelectSort}
                      isLoading={isFetching && !isFetchingNextPage}
                      sort={selectedSort.sort}
                    />
                  </InfiniteScroll>
                </Box>
              </>
            )}
          </>
        </VStack>
      </HStack>
    </MainLayout>
  )
}

export default MainPage
