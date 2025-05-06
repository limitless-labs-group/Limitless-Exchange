'use client'

import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import debounce from 'lodash.debounce'
import NextLink from 'next/link'
import { useState, useEffect, useRef, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import MarketCardMobile from '@/components/common/markets/market-cards/market-card-mobile'
import Skeleton from '@/components/common/skeleton'
import SortFilter from '@/components/common/sort-filter'
import { SearchInput } from './components/search-input'
import { sortAtom } from '@/atoms/market-sort'
import { useInfinitySearch } from '@/hooks/use-search'
import { useUrlParams } from '@/hooks/use-url-param'
import { usePriceOracle } from '@/providers'
import SearchIcon from '@/resources/icons/search.svg'
import { ChangeEvent, useAccount, useAmplitude } from '@/services'
import { useMarkets } from '@/services/MarketsService'
import { h3Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, Sort, SortStorageName } from '@/types'
import { sortMarkets } from '@/utils/market-sorting'

const SearchPage = () => {
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [sort, setSort] = useAtom(sortAtom)
  const { convertTokenAmountToUsd } = usePriceOracle()
  const { trackChanged } = useAmplitude()
  const { updateParams, getParam } = useUrlParams()
  const { referralCode } = useAccount()
  const query = getParam('query')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()

      if (isMobile) {
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.click()
        }, 100)
      }
    }
    if (referralCode) {
      updateParams({ r: referralCode })
    }
  }, [])

  useEffect(() => {
    if (query) {
      setSearch(query)
      setSearchQuery(query)
    }
  }, [query])

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (value.length >= 3) {
          setSearchQuery(value)
          updateParams({ query: value })
          trackChanged(ChangeEvent.SearchPerfomed)
          trackChanged(ChangeEvent.SearchQuery, { text: value })
        } else if (value.length === 0) {
          setSearchQuery('')
        }
      }, 500),
    [trackChanged]
  )

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  useEffect(() => {
    debouncedSearch(search)
  }, [search, debouncedSearch])

  const {
    data: searchedMarkets,
    fetchNextPage: fetchSearch,
    hasNextPage: hasSearch,
    isFetching: isSearchMarketsLoading,
  } = useInfinitySearch(searchQuery)

  const {
    data: allMarkets,
    fetchNextPage,
    hasNextPage,
    isFetching: isAllMarketsLoading,
  } = useMarkets(null)

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const allFetchedMarkets: Market[] = useMemo(() => {
    return allMarkets?.pages.flatMap((page) => page.data.markets) || []
  }, [allMarkets?.pages])
  const searchFetchedMarkets: Market[] = useMemo(() => {
    return searchedMarkets?.pages.flatMap((page) => page.data.markets) || []
  }, [searchedMarkets?.pages])

  const markets = useMemo(() => {
    const data = searchQuery ? searchFetchedMarkets : allFetchedMarkets
    return sortMarkets(data, sort?.sort || Sort.DEFAULT, convertTokenAmountToUsd)
  }, [allFetchedMarkets, searchFetchedMarkets, searchQuery, sort.sort, convertTokenAmountToUsd])

  const handleSelectSort = (options: Sort, name: SortStorageName) => {
    window.localStorage.setItem(name, JSON.stringify(options))
    setSort({ sort: options ?? Sort.DEFAULT })
  }

  const isLoading = isAllMarketsLoading || isSearchMarketsLoading
  const hasNoResults = !isLoading && searchQuery

  return (
    <VStack
      mt='24px'
      w='full'
      maxW='716px'
      alignItems='center'
      justifyContent='center'
      gap='16px'
      margin='auto'
    >
      <SearchInput
        value={search}
        onChange={handleSearch}
        before={<SearchIcon width={16} height={16} />}
        placeholder={isMobile ? 'Search' : 'Search for any markets'}
        inputRef={inputRef}
      />
      {markets.length > 0 && !isLoading ? (
        <>
          {' '}
          <Flex justifyContent='start' width='100%' mt='16px'>
            {searchQuery ? (
              <Text {...h3Bold}>{`Search results for "${searchQuery}"`}</Text>
            ) : (
              <Text {...h3Bold}>All markets</Text>
            )}
          </Flex>
          <Flex justifyContent='start' width='100%'>
            <SortFilter onChange={handleSelectSort} sort={sort.sort} withPadding={false} />
          </Flex>
        </>
      ) : null}

      {isLoading ? (
        <>
          {[...Array(6)].map((_, index) => (
            <Box key={`skeleton-straight-${index}`} w='full'>
              <Skeleton height={160} />
            </Box>
          ))}
        </>
      ) : null}

      {markets.length > 0 && !isLoading ? (
        <Box className='full-container' w='full'>
          <InfiniteScroll
            dataLength={markets.length}
            next={searchQuery ? fetchSearch : fetchNextPage}
            hasMore={searchQuery ? hasSearch : hasNextPage}
            loader={
              <HStack w='full' gap='8px' justifyContent='center' mt='8px' mb='24px'>
                <Loader />
                <Text {...paragraphRegular}>Loading more markets</Text>
              </HStack>
            }
          >
            <VStack w='full' spacing={4}>
              {markets?.map((market: Market, index: number) => {
                return isMobile ? (
                  <MarketCardMobile
                    market={market}
                    analyticParams={{ bannerPosition: 1, bannerPaginationPage: 1 }}
                    key={index}
                    variant='row'
                  />
                ) : (
                  <MarketCard
                    market={market}
                    analyticParams={{ bannerPosition: 1, bannerPaginationPage: 1 }}
                    key={index}
                    variant='row'
                  />
                )
              })}
            </VStack>
          </InfiniteScroll>
        </Box>
      ) : hasNoResults ? (
        <VStack alignItems={isMobile ? 'center' : 'start'} w='full' py='40px' spacing='16px'>
          <Text {...h3Bold} color='grey.800'>
            {`No search results found for "${searchQuery}"`}
          </Text>
          <Button size='sm' colorScheme='blue'>
            <NextLink href='https://discord.gg/dHWCC6Cfj2'>Suggest market</NextLink>
          </Button>
        </VStack>
      ) : null}
    </VStack>
  )
}

export default SearchPage
