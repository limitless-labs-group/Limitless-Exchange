import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DashboardTagId } from '@/components/common/markets/dashboard-section'
import { calculateMarketPrice } from './MarketsService'
import { Market } from '@/types'
import { getPrices } from '@/utils/market'

interface ApiResponse {
  data: Market[]
  totalMarketsCount: number
}

interface DashboardPage {
  data: {
    markets: Market[]
    totalAmount: number
  }
  next: number
}

interface OddsData {
  prices: number[]
}

const DASHBOARD_LIMIT = 65

export const useInfinityDashboard = (tagId?: DashboardTagId) => {
  return useInfiniteQuery<DashboardPage, Error>({
    queryKey: ['dashboard-infinity', tagId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/dashboard`,
        {
          params: {
            page: pageParam,
            limit: DASHBOARD_LIMIT,
            ...(tagId && { tagId }),
          },
        }
      )

      const ammMarkets = response.data.data.filter((market) => market.tradeType === 'amm')

      const marketDataForMultiCall = ammMarkets.map((market) => ({
        address: market.address as `0x${string}`,
        decimals: market.collateralToken.decimals,
      }))

      const pricesResult = ammMarkets.length > 0 ? await getPrices(marketDataForMultiCall) : []

      const _markets = new Map<`0x${string}`, OddsData>(
        pricesResult.map((item) => [item.address, { prices: item.prices }])
      )

      const result = response.data.data.map((market) => {
        return {
          ...market,
          prices:
            market.tradeType === 'amm'
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
          totalAmount: response.data.totalMarketsCount,
        },
        next: (pageParam as number) + 1,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.markets?.length === DASHBOARD_LIMIT ? lastPage.next : undefined
    },
    refetchOnWindowFocus: false,
    enabled: !!tagId,
  })
}
