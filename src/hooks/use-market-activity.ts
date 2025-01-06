import { useInfiniteQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'
import { ClobTradeEvent } from '@/types/orders'

export default function useMarketActivity(slug?: string) {
  return useInfiniteQuery<
    {
      events: ClobTradeEvent[]
      totalPages: number
    },
    Error
  >({
    queryKey: ['market-activity', slug],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const response: AxiosResponse<{
        events: ClobTradeEvent[]
        totalPages: number
      }> = await limitlessApi.get(`/markets/${slug}/events`, {
        params: {
          page: pageParam,
          limit: 10,
        },
      })
      return { data: response.data, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1, //default page number
    getNextPageParam: (lastPage) => {
      console.log(lastPage)
      // @ts-ignore
      return lastPage?.data.totalPages < lastPage.next ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
    enabled: !!slug,
    keepPreviousData: true,
  })
}
