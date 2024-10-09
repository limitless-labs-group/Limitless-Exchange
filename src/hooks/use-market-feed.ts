import { Address } from 'viem'
import { useInfiniteQuery, useQuery, UseQueryResult } from '@tanstack/react-query'
import { limitlessApi } from '@/services'
import axios, { AxiosResponse } from 'axios'
import { usePathname } from 'next/navigation'
import { isMobile } from 'react-device-detect'
import { FeedEntity, FeedResponse } from '@/types'

export type MarketFeedData = {
  createdAt: string
  id: number
  eventType: 'NEW_TRADE'
  eventBody: {
    symbol: string
    txHash: string
    account: Address
    address: Address
    outcome: 'YES' | 'NO'
    strategy: 'Sell' | 'Buy'
    contracts: string
    marketTitle: string
    tradeAmount: string
    tradeAmountUSD: string
  }
  bodyHash: string
}

export function useMarketFeed(marketAddress?: string) {
  const pathname = usePathname()
  return useQuery<AxiosResponse<MarketFeedData[]>>({
    queryKey: ['market-feed', marketAddress],
    queryFn: async () => {
      return limitlessApi.get(`/markets/${marketAddress}/get-feed-events`)
    },
    refetchInterval: pathname === '/' ? 10000 : false,
    enabled: !isMobile && !!marketAddress,
  }) as UseQueryResult<AxiosResponse<MarketFeedData[]>>
}

export function useMarketInfinityFeed(marketAddress?: string) {
  return useInfiniteQuery<MarketFeedData[], Error>({
    queryKey: ['market-page-feed', marketAddress],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${marketAddress}/get-feed-events`
      const response: AxiosResponse<MarketFeedData[]> = await axios.get(baseUrl, {
        params: {
          page: pageParam,
          limit: 10,
        },
      })
      return { data: response.data, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      // @ts-ignore
      return lastPage.data.length === 10 ? lastPage.next : null
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!marketAddress,
  })
}
