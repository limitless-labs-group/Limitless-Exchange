import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { Address } from 'viem'
import { LIMIT_PER_PAGE } from '@/constants/application'
import { Market, OddsData } from '@/types'
import { calculateMarketPrice, getPrices } from '@/utils/market'

export interface ApiSearchResponse {
  markets: Market[]
}

export interface SearchPage {
  data: {
    markets: Market[]
  }
  next: number
}

export function useInfinitySearch(query: string) {
  return useInfiniteQuery<SearchPage, Error, InfiniteData<SearchPage>>({
    queryKey: ['search-market', query],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL
      const { data: response }: AxiosResponse<ApiSearchResponse> = await axios.get(
        `${baseUrl}/markets/search`,
        {
          params: {
            query,
            page: pageParam,
            similarityThreshold: 0.3,
            limit: LIMIT_PER_PAGE,
          },
        }
      )

      const ammMarkets = response.markets.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as Address,
        decimals: market.collateralToken.decimals,
      }))

      const pricesResult = ammMarkets.length > 0 ? await getPrices(marketDataForMultiCall) : []

      const _markets = new Map<`0x${string}`, OddsData>(
        pricesResult.map((item) => [item.address, { prices: item.prices }])
      )

      const result = response.markets.map((market) => {
        return {
          ...market,
          prices:
            market.tradeType === 'amm' && market.address
              ? _markets.get(market.address as `0x${string}`)?.prices || [50, 50]
              : [
                  calculateMarketPrice(market?.prices?.[0]),
                  calculateMarketPrice(market?.prices?.[1]),
                ],
        }
      })

      return {
        data: {
          markets: result,
        },
        next: (pageParam as number) + 1,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.data.markets.length < LIMIT_PER_PAGE ? null : lastPage.next
    },
    enabled: !!query,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}
