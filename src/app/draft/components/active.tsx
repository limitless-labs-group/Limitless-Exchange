'use client'

import { Flex, VStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loader from '@/components/common/loader'
import { DraftMarketCard } from '@/app/draft/components/draft-card'
import { useUrlParams } from '@/hooks/use-url-param'
import { useMarkets } from '@/services/MarketsService'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

export const ActiveMarkets = () => {
  const router = useRouter()
  const { getParam } = useUrlParams()
  const isEnabled = getParam('tab') === 'active'

  const { data, fetchNextPage, hasNextPage, isLoading } = useMarkets(null, isEnabled, {
    'x-ignore-limits': 'true',
  })

  const markets: Market[] = useMemo(() => {
    const allMarkets = data?.pages.flatMap((page) => page.data.markets) || []
    return allMarkets.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [data?.pages])

  const handleClick = (marketSlug: string, tradeType: string, marketType: string) => {
    const baseUrl = `/draft/?active-market=${marketSlug}&marketType=`
    const addon = tradeType === 'amm' ? 'amm' : marketType === 'single' ? 'clob' : 'group'
    router.push(baseUrl + addon)
  }

  return isLoading ? (
    <VStack h='calc(100vh - 350px)' w='full' alignItems='center' justifyContent='center'>
      <Text {...paragraphMedium}>Fetching active markets just for you!</Text>
      <Loader />
    </VStack>
  ) : (
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
                onClick={() => handleClick(market.slug, market.tradeType, market.marketType)}
                withBadge
              />
            )
          })}
        </InfiniteScroll>
      </VStack>
    </Flex>
  )
}
