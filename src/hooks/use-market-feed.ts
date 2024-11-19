import { useInfiniteQuery, useQuery, UseQueryResult } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { usePathname } from 'next/navigation'
import { Address } from 'viem'
import { limitlessApi } from '@/services'
import { FeedEventUser } from '@/types'

export type MarketFeedData = {
  createdAt: string
  id: number
  eventType: 'NEW_TRADE'
  data: {
    symbol: string
    txHash: string
    address: Address
    outcome: 'YES' | 'NO'
    strategy: 'Sell' | 'Buy'
    contracts: string
    marketTitle: string
    tradeAmount: string
    tradeAmountUSD: string
  }
  user?: FeedEventUser
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
    enabled: !!marketAddress,
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
