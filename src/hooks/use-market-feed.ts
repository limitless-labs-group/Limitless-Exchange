import { useInfiniteQuery, useQuery, UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { usePathname } from 'next/navigation'
import { Address } from 'viem'
import { limitlessApi, useAccount } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { FeedEventUser, Market } from '@/types'

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

export function useMarketFeed(market: Market | null) {
  const pathname = usePathname()
  const { web3Wallet } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useQuery<AxiosResponse<MarketFeedData[]>>({
    queryKey: ['market-feed', market?.slug],
    queryFn: async () => {
      const client = web3Wallet ? privateClient : limitlessApi
      const url =
        market?.tradeType === 'clob'
          ? `/markets/${market.slug}/events`
          : `/markets/${market?.address}/get-feed-events`
      return client.get(url)
    },
    refetchInterval: pathname === '/' ? 10000 : false,
    enabled: !!market,
  }) as UseQueryResult<AxiosResponse<MarketFeedData[]>>
}

export function useMarketClobInfinityFeed(marketSlug?: string) {
  const { web3Wallet } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useInfiniteQuery<MarketFeedData[], Error>({
    queryKey: ['market-page-clob-feed', marketSlug],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const client = web3Wallet ? privateClient : limitlessApi
      const baseUrl = `/markets/${marketSlug}/events`
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
    keepPreviousData: true,
    enabled: !!marketSlug,
  })
}

export function useMarketInfinityFeed(marketAddress?: string | null, isActive = false) {
  const { web3Wallet } = useAccount()
  const privateClient = useAxiosPrivateClient()
  return useInfiniteQuery<MarketFeedData[], Error>({
    queryKey: ['market-page-feed', marketAddress],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const client = web3Wallet ? privateClient : limitlessApi
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
