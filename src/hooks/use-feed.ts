import { useInfiniteQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import useClient from '@/hooks/use-client'
import { FeedEntity, FeedResponse } from '@/types'

export function useFeed() {
  const { client, isLogged } = useClient()
  return useInfiniteQuery<FeedEntity<unknown>[], Error>({
    queryKey: ['feed', isLogged],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const response: AxiosResponse<FeedResponse> = await client.get('/feed', {
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
      return lastPage?.data.totalPages < lastPage.next ? null : lastPage.next
    },
    refetchOnWindowFocus: false,
    // keepPreviousData: true,
  })
}
