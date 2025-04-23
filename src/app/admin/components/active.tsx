'use client'

import { Flex, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { AdminMarketCard } from './market-card'
import { useCreateMarketModal } from '@/hooks/use-create-market-modal'
import { useMarkets } from '@/services/MarketsService'
import { Market } from '@/types'

export const AdminActiveMarkets = () => {
  const { data, fetchNextPage, hasNextPage } = useMarkets(null)
  const { setMarket, open } = useCreateMarketModal()

  const markets: Market[] = useMemo(() => {
    const allMarkets = data?.pages.flatMap((page) => page.data.markets) || []
    return allMarkets.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [data?.pages])

  const handleClick = (market: Market) => {
    setMarket({
      id: market.slug,
      market,
      type: 'active',
      mode: 'edit',
      marketType: market.tradeType,
    })
    open()
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
              <AdminMarketCard
                market={market}
                key={market.id}
                onClick={() => handleClick(market)}
              />
            )
          })}
        </InfiniteScroll>
      </VStack>
    </Flex>
  )
}
