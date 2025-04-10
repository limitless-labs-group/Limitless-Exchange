import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Market } from '@/types'

export type SearchResponse = {
  success: boolean
  markets: Market[]
}

export const useSearch = (query: string) => {
  const privateClient = useAxiosPrivateClient()

  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const result: AxiosResponse<SearchResponse> = await privateClient.get(
        `/search?query=${query}&limit=100&offset=0&similarityThreshold=0.1`
      )
      return result.data
    },
    enabled: !!query,
  })
}
