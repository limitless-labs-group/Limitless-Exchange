import { useInfiniteQuery, useQuery, UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { usePathname } from 'next/navigation'
import { Address } from 'viem'
import { limitlessApi, useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
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

export function useMarketFeed(marketAddress?: string | null) {
  const pathname = usePathname()
  const { isLoggedIn } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useQuery<AxiosResponse<MarketFeedData[]>>({
    queryKey: ['market-feed', marketAddress],
    queryFn: async () => {
      const client = isLoggedIn ? privateClient : limitlessApi
      return client.get(`/markets/${marketAddress}/get-feed-events`)
    },
    refetchInterval: pathname === '/' ? 10000 : false,
    enabled: !!marketAddress,
  }) as UseQueryResult<AxiosResponse<MarketFeedData[]>>
}

export function useMarketClobInfinityFeed(marketSlug?: string) {
  const { isLoggedIn } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useInfiniteQuery<MarketFeedData[], Error>({
    queryKey: ['market-page-clob-feed', marketSlug],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const client = isLoggedIn ? privateClient : limitlessApi
      const baseUrl = `/markets/${marketSlug}/events`
      const response: AxiosResponse<MarketFeedData[]> = await client.get(baseUrl, {
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
    enabled: !!marketSlug,
  })
}

export function useMarketInfinityFeed(marketAddress?: string | null, isActive = false) {
  const { isLoggedIn } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useInfiniteQuery<MarketFeedData[], Error>({
    queryKey: ['market-page-feed', marketAddress],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const client = isLoggedIn ? privateClient : limitlessApi
      const baseUrl = `/markets/${marketAddress}/get-feed-events`
      const response: AxiosResponse<MarketFeedData[]> = await client.get(baseUrl, {
        params: {
          page: pageParam,
          limit: 30,
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
    placeholderData: (placeholder) => placeholder,
    enabled: !!marketAddress && isActive,
  })
}
