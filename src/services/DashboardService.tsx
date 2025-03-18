import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DashboardTagId } from '@/components/common/markets/dashboard-section'
import { Market } from '@/types'

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
      return {
        data: {
          markets: response.data.data,
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
