'use client'

import { Link, Box, HStack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import { MarketCategoryHeader } from '@/components/common/markets/market-category-header'
import MarketsSection from '@/components/common/markets/markets-section'
import { CategoryItems } from '@/components/common/markets/sidebar-item'
import TopMarkets from '@/components/common/markets/top-markets'
import { MainLayout } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import { useIsMobile } from '@/hooks'
import useMarketGroup from '@/hooks/use-market-group'
import usePageName from '@/hooks/use-page-name'
import { usePriceOracle } from '@/providers'
import GridIcon from '@/resources/icons/sidebar/Markets.svg'
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
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketGroup, Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'

const MainPage = () => {
  const searchParams = useSearchParams()
  const { data: categories } = useCategories()
  const { onCloseMarketPage, onOpenMarketPage } = useTradingService()
  /**
   * ANALYTICS
   */
  const { trackClicked, trackOpened } = useAmplitude()
  const category = searchParams.get('category')
  const market = searchParams.get('market')
  const slug = searchParams.get('slug')
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

  const { selectedCategory, handleCategory } = useTokenFilter()

  const { convertTokenAmountToUsd } = usePriceOracle()
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useMarkets(categoryEntity)

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: (Market | MarketGroup)[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages, category])

  const filteredAllMarkets = useMemo(() => {
    if (!markets) return []
    if (!selectedCategory) return markets
    if (selectedCategory) {
      return markets.filter((market) => market.category === selectedCategory?.name)
    }

    return markets
  }, [markets, selectedCategory])

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
            {isMobile ? (
              <HStack
                gap='8px'
                px='8px'
                overflowX='auto'
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none',
                  '-ms-overflow-style': 'none',
                }}
                minW='100%'
              >
                <NextLink href='/' passHref style={{ width: isMobile ? 'fit-content' : '100%' }}>
                  <Link
                    onClick={() => {
                      trackClicked<ProfileBurgerMenuClickedMetadata>(
                        ClickEvent.ProfileBurgerMenuClicked,
                        {
                          option: 'Markets',
                        }
                      )
                      handleCategory(undefined)
                    }}
                    variant='transparent'
                    w='full'
                    h='24px'
                    textDecoration='none'
                    bg={pageName === 'Explore Markets' && !selectedCategory ? 'grey.100' : 'unset'}
                    rounded='8px'
                  >
                    <HStack w='full' whiteSpace='nowrap'>
                      <GridIcon width={16} height={16} />
                      <Text fontWeight={500} fontSize='14px'>
                        All markets
                      </Text>
                    </HStack>
                  </Link>
                </NextLink>

                <CategoryItems />
              </HStack>
            ) : null}

            {selectedCategory ? (
              <MarketCategoryHeader name={selectedCategory.name} />
            ) : (
              <TopMarkets markets={banneredMarkets as Market[]} isLoading={isBanneredLoading} />
            )}

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
                totalAmount={filteredAllMarkets?.length ?? ''}
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
