import { mockMarkets } from '@/services/mock-markets'
import { Market, MarketData } from '@/types'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'

const LIMIT_PER_PAGE = 10

/**
 * Fetches and manages paginated active market data using the `useInfiniteQuery` hook.
 * Active market is FUNDED market and not hidden only
 *
 * @returns {MarketData[]} which represents pages of markets
 */
export function useMarkets() {
  return useInfiniteQuery<MarketData, Error>({
    queryKey: ['markets'],
    queryFn: async ({ pageParam = 1 }) => {
      // const response = await axios.get(
      //   `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/active`,
      //   {
      //     params: {
      //       page: pageParam,
      //       limit: LIMIT_PER_PAGE,
      //     },
      //   }
      // )
      const response = mockMarkets
      return { data: response.data, next: 1 }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      return lastPage.next
    },
  })
}

export function useAllMarkets() {
  const { data: markets } = useQuery({
    queryKey: ['allMarkets'],
    queryFn: async () => {
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets`)
      const response = mockMarkets

      return response.data as Market[]
    },
  })

  return useMemo(() => markets ?? [], [markets])
}

export function useMarketByConditionId(conditionId: string) {
  const { data: market } = useQuery({
    queryKey: ['marketByConditionId', conditionId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/conditions/${conditionId}`
      )
      return response.data as Market
    },
  })

  return useMemo(() => market ?? null, [market])
}

export function useMarket(address?: string) {
  const { data: market } = useQuery({
    queryKey: ['market', address],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${address}`
      )
      return response.data as Market
    },
    enabled: address !== '0x',
  })

  return useMemo(() => market ?? null, [market])
}
