'use client'

import { HStack, Text, VStack, Box } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import React, { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import { MarketCategoryHeader } from '@/components/common/markets/market-category-header'
import MarketsSection from '@/components/common/markets/markets-section'
import TopMarkets from '@/components/common/markets/top-markets'
import { Modal } from '@/components/common/modals/modal'
import { WelcomeModal } from '@/components/common/welcome-modal'
import { ScrollableCategories } from '@/components/layouts/categories-desktop'
import { sortAtom } from '@/atoms/market-sort'
import { welcomeModalAtom } from '@/atoms/onboard'
import { MainLayout } from '@/components'
import { useTokenFilter } from '@/contexts/TokenFilterContext'
import usePageName from '@/hooks/use-page-name'
import { useUrlParams } from '@/hooks/use-url-param'
import {
  OpenEvent,
  PageOpenedMetadata,
  DashboardName,
  useAmplitude,
  useTradingService,
  useAccount,
  ChangeEvent,
  useCategories,
} from '@/services'
import { useBanneredMarkets, useMarket, useActiveMarkets } from '@/services/MarketsService'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Dashboard, Market, MarketType, Sort, SortStorageName } from '@/types'
import { ONBOARDING } from '@/utils/consts'
import { getSortValue } from '@/utils/market-sorting'

const MainPage = () => {
  const { getParam } = useUrlParams()
  const market = getParam('market')
  const dashboardSearch = getParam('dashboard')
  const referralCode = getParam('r')
  const category = getParam('category')
  const pagename = usePageName()
  const { data: categories } = useCategories()

  const {
    onCloseMarketPage,
    onOpenMarketPage,
    market: selectedMarket,
    groupMarket,
  } = useTradingService()
  const { referralCode: ownRefCode, isLoggedIn } = useAccount()
  const { trackOpened, trackChanged } = useAmplitude()
  const { data: marketData } = useMarket(market ?? undefined)
  const { data: banneredMarkets, isFetching: isBanneredLoading } = useBanneredMarkets(null)
  const { selectedCategory, handleCategory, dashboard, handleDashboard } = useTokenFilter()
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)
  const [onboardModal, setOnboardModal] = useAtom(welcomeModalAtom)
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useActiveMarkets({
    categoryId: selectedCategory?.id,
    sortBy: getSortValue(selectedSort.sort),
  })

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
    if (marketData) {
      if (
        marketData.marketType === ('single' as MarketType) &&
        selectedMarket?.slug !== marketData.slug
      ) {
        onOpenMarketPage(marketData)
        return
      }
      if (
        marketData.marketType === ('group' as MarketType) &&
        groupMarket?.slug !== marketData.slug
      ) {
        onOpenMarketPage(marketData)
        return
      }
    }
  }, [marketData])

  useEffect(() => {
    const dashboardNameMapping: Record<string, string> = {
      marketwatch: DashboardName.MarketWatch,
    }

    const analyticData: PageOpenedMetadata = {
      page: 'Explore Markets',
      ...(selectedCategory && { category: [selectedCategory.name.toLowerCase()] }),
      ...(dashboard && { dashboard: dashboardNameMapping[dashboard.toLowerCase()] || dashboard }),
    }
    trackOpened(OpenEvent.PageOpened, analyticData)
  }, [selectedCategory?.name, dashboard])

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

  useEffect(() => {
    if (typeof window !== 'undefined' && referralCode) {
      const isOnboarded = window.localStorage.getItem(ONBOARDING)
      if (isOnboarded && isOnboarded === 'true') return
      setOnboardModal(true)
    }
  }, [referralCode])

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, JSON.stringify(options))
    setSelectedSort({ sort: options ?? Sort.DEFAULT })
  }

  useEffect(() => {
    if (dashboardSearch) {
      handleDashboard(dashboardSearch as Dashboard)
    }
  }, [dashboardSearch])

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: Market[] = useMemo(() => {
    console.log('data', data)
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  const isWelcomeShown = useMemo(() => {
    return onboardModal && referralCode && referralCode !== ownRefCode && !isLoggedIn
  }, [onboardModal, referralCode, ownRefCode, isLoggedIn])

  const headerContent = useMemo(() => {
    if (pagename === 'Categories' || selectedCategory) return
    return <TopMarkets markets={banneredMarkets as Market[]} isLoading={isBanneredLoading} />
  }, [selectedCategory, banneredMarkets, isBanneredLoading])

  const header = (
    <HStack py='4px' px='12px' bg='grey.50' gap={0} pt='4px' mb='12px'>
      <ScrollableCategories />
    </HStack>
  )

  return (
    <MainLayout layoutPadding={'0px'} headerComponent={header}>
      <VStack w='full' spacing={0}>
        {headerContent}

        <Box className='full-container' w={isMobile ? 'full' : 'unset'}>
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
              markets={markets as Market[]}
              handleSelectSort={handleSelectSort}
              isLoading={isFetching && !isFetchingNextPage}
              sort={selectedSort.sort}
            />
          </InfiniteScroll>
        </Box>
      </VStack>
      {isWelcomeShown ? (
        <Modal
          isOpen={onboardModal}
          onClose={() => {
            trackChanged(ChangeEvent.ReferralWelcomeClosed)
            setOnboardModal(false)
          }}
        >
          <WelcomeModal onClose={() => setOnboardModal(false)} referralCode={referralCode ?? ''} />
        </Modal>
      ) : null}
    </MainLayout>
  )
}

export default MainPage
