'use client'

import { Flex, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { DraftMarketCard } from '@/app/draft/components/draft-card'
import { useMarkets } from '@/services/MarketsService'
import { Market } from '@/types'

export const ActiveMarkets = () => {
  const router = useRouter()

  const { data, fetchNextPage, hasNextPage } = useMarkets(null)

  const markets: Market[] = useMemo(() => {
    const allMarkets = data?.pages.flatMap((page) => page.data.markets) || []
    return allMarkets.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [data?.pages])

  const handleClick = (marketSlug: string) => {
    router.push(`/draft/?active-market=${marketSlug}`)
  }

  return (
    <Flex justifyContent={'center'} position='relative'>
      <VStack w='868px' spacing={4} mb='66px'>
        <InfiniteScroll
          className='scroll'
          dataLength={markets?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
          loader={null}
        >
          {markets?.map((market: Market) => {
            return (
              <DraftMarketCard
                market={market}
                key={market.id}
                onClick={() => handleClick(market.slug)}
              />
            )
          })}
        </InfiniteScroll>
      </VStack>
    </Flex>
  )
}
