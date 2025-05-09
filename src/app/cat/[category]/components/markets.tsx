'use client'

import {
  HStack,
  Text,
  VStack,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  useTab,
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { useEffect, useMemo, forwardRef } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Chat from '@/components/chat'
import Loader from '@/components/common/loader'
import MarketsSection from '@/components/common/markets/markets-section'
import { ScrollableCategories } from '@/components/layouts/categories-desktop'
import { sortAtom } from '@/atoms/market-sort'
import { MainLayout } from '@/components'
import { useUrlParams } from '@/hooks/use-url-param'
import { useTradingService } from '@/services'
import { useMarket, useActiveMarkets } from '@/services/MarketsService'
import { captionMedium, h3Medium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketType, Sort, SortStorageName } from '@/types'
import { getSortValue } from '@/utils/market-sorting'

export interface CategoryMarketsPageProps {
  categoryId: number
  categoryName?: string
}

interface CustomTabProps {
  children: React.ReactNode
  [x: string]: any
}

const CustomTab = forwardRef<HTMLElement, CustomTabProps>((props, ref) => {
  const tabProps = useTab({ ...props, ref })
  const isSelected = !!tabProps['aria-selected']

  return (
    <Tab {...tabProps}>
      <Text {...captionMedium} color={isSelected ? 'grey.800' : 'grey.500'}>
        {props.children}
      </Text>
    </Tab>
  )
})

CustomTab.displayName = 'CustomTab'

const CategoryMarketsPage = ({ categoryId, categoryName }: CategoryMarketsPageProps) => {
  const { getParam } = useUrlParams()
  const market = getParam('market')

  const {
    onCloseMarketPage,
    onOpenMarketPage,
    market: selectedMarket,
    groupMarket,
  } = useTradingService()
  const { data: marketData } = useMarket(market ?? undefined)
  const [selectedSort, setSelectedSort] = useAtom(sortAtom)
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useActiveMarkets({
    categoryId,
    sortBy: getSortValue(selectedSort.sort),
  })

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

  const totalAmount = useMemo(() => data?.pages[0]?.data.totalAmount ?? 0, [data?.pages])

  const markets: Market[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.markets) || []
  }, [data?.pages])

  useEffect(() => {
    return () => {
      onCloseMarketPage()
    }
  }, [])

  const header = (
    <HStack py='4px' px={isMobile ? '4px' : '12px'} bg='grey.50' gap={0} pt='4px' mb='12px'>
      <ScrollableCategories />
    </HStack>
  )

  return (
    <MainLayout layoutPadding={'0px'} headerComponent={header}>
      <VStack w='full' spacing={0} height={'100%'}>
        {isMobile ? (
          <Box
            w='full'
            mt='20px'
            position='relative'
            h='calc(100vh - 190px)'
            display='flex'
            flexDirection='column'
          >
            <Tabs
              position='sticky'
              top='0'
              variant='common'
              zIndex='10'
              w='full'
              display='flex'
              flexDirection='column'
              flex='1'
            >
              <Box position='fixed' top='110px' zIndex='10' w='full' bg='grey.50' pb='5px'>
                <Text {...h3Medium} ml='12px' mb='8px' mt='10px'>
                  {categoryName}
                </Text>
                <TabList>
                  <CustomTab>Markets</CustomTab>
                  <CustomTab>Chat</CustomTab>
                </TabList>
                <Box position='relative' width='full' mt='-2px'>
                  <Box position='absolute' width='full' height='1px' bg='grey.200' />
                  <TabIndicator height='1px' bg='grey.800' transitionDuration='200ms !important' />
                </Box>
              </Box>

              <TabPanels flex='1' overflow='hidden'>
                <TabPanel p='20px 0 0' h='100%'>
                  <Box
                    className='full-container'
                    w='full'
                    h='100%'
                    overflowY='auto'
                    id='marketsScrollContainer'
                  >
                    <InfiniteScroll
                      className='scroll'
                      dataLength={markets?.length ?? 0}
                      next={fetchNextPage}
                      hasMore={hasNextPage}
                      scrollableTarget='marketsScrollContainer'
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
                        categoryName={categoryName}
                        withChat={false}
                      />
                    </InfiniteScroll>
                  </Box>
                </TabPanel>
                <TabPanel p={0} h='100%'>
                  <Box h='100%' position='relative'>
                    <Box
                      w='full'
                      borderRadius='md'
                      h='full'
                      overflow='auto'
                      display='flex'
                      flexDirection='column'
                      mb='20px'
                    >
                      <Chat />
                    </Box>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        ) : (
          <HStack
            className='w-full'
            alignItems='flex-start'
            w='full'
            maxW='1400px'
            justifyContent='space-between'
            spacing={4}
          >
            <Box
              className='full-container'
              w='65%'
              h='calc(100vh - 68px - 60px)'
              overflowY='auto'
              id='marketsScrollContainer'
            >
              <InfiniteScroll
                className='scroll'
                dataLength={markets?.length ?? 0}
                next={fetchNextPage}
                hasMore={hasNextPage}
                scrollableTarget='marketsScrollContainer'
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
                  categoryName={categoryName}
                  withChat
                />
              </InfiniteScroll>
            </Box>
            <Box w='35%' h='calc(100vh - 150px - 100px)' position='relative'>
              <Box mt='24px' h='40px' borderBottom='1px solid' borderColor='grey.100'>
                <Text {...h3Medium} alignItems='center' display='flex' h='full'>
                  Chat
                </Text>
              </Box>
              <Box
                w='full'
                borderRadius='md'
                h='full'
                overflow='hidden'
                display='flex'
                flexDirection='column'
              >
                <Chat />
              </Box>
            </Box>
          </HStack>
        )}
      </VStack>
    </MainLayout>
  )
}

export default CategoryMarketsPage
