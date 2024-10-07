import { Address } from 'viem'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { limitlessApi } from '@/services'
import { AxiosResponse } from 'axios'
import { usePathname } from 'next/navigation'
import { isMobile } from 'react-device-detect'

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
  const refetch = marketAddress && ['/', 'market'].some((path) => pathname.includes(path))
  return useQuery<AxiosResponse<MarketFeedData[]>>({
    queryKey: ['market-feed', marketAddress],
    queryFn: async () => {
      return limitlessApi.get(`/markets/${marketAddress}/get-feed-events`)
    },
    refetchInterval: refetch ? 10000 : false,
    enabled: (!isMobile || pathname.includes('market')) && !!marketAddress,
  }) as UseQueryResult<AxiosResponse<MarketFeedData[]>>
}
