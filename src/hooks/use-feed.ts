import { useInfiniteQuery } from '@tanstack/react-query'
import { FeedEntity } from '@/types'
import axios, { AxiosResponse } from 'axios'

export function useFeed() {
  return useInfiniteQuery<FeedEntity<unknown>[], Error>({
    queryKey: ['feed'],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/feed`
      const response: AxiosResponse<FeedEntity<unknown>[]> = await axios.get(baseUrl, {
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
      return lastPage?.data.length < 10 ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  })
}
