'use client'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import MarketCard from '@/components/common/markets/market-cards/market-card'
import { SearchInput } from './components/search-input'
import { useSearch } from '@/hooks/use-search'
import SearchIcon from '@/resources/icons/search.svg'
import { Market } from '@/types'

const SearchPage = () => {
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data } = useSearch(searchQuery)

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchQuery(search)
    }
  }

  return (
    <VStack mt='24px' w='full' maxW='1200p' alignItems='center' justifyContent='center'>
      <SearchInput
        value={search}
        onChange={(e) => handleSearch(e)}
        onKeyDown={handleKeyDown}
        before={<SearchIcon />}
        after={<Text>Hit Enter</Text>}
        inputRef={inputRef}
      />
      {data
        ? data?.markets?.map((market: Market, index: number) => {
            return (
              <Text key={index}>{market.slug}</Text>
              // <MarketCard
              //   market={market}
              //   analyticParams={{ bannerPosition: 1, bannerPaginationPage: 1 }}
              //   key={index}
              // />
            )
          })
        : null}
    </VStack>
  )
}

export default SearchPage
