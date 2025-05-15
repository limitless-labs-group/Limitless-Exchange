import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'

export interface HolderUserData {
  user: string
  username: string
  contracts: string
  contractsFormatted: string
  valueUSDC: string
  valueUSDCFormatted: string
  tokenId: string
}

interface DataSection {
  data: HolderUserData[]
  total: number
}

interface ApiResponse {
  yes?: DataSection
  no?: DataSection
}

interface HoldersPage {
  data: {
    holders: ApiResponse
  }
  next: number
}

export const HOLDERS_LIMIT = 10

export const useInfinityTopHolders = (slug: string) => {
  return useInfiniteQuery<HoldersPage, Error, InfiniteData<HoldersPage>>({
    queryKey: ['top-holders', slug],
    queryFn: async ({ pageParam = 1 }) => {
      const { data: response }: AxiosResponse<ApiResponse> = await limitlessApi.get(
        `/markets/${slug}/holders`,
        {
          params: {
            page: pageParam,
            limit: HOLDERS_LIMIT,
          },
        }
      )

      return {
        data: {
          holders: response,
        },
        next: (pageParam as number) + 1,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const yesCount = lastPage.data.holders.yes?.data.length ?? 0
      const noCount = lastPage.data.holders.no?.data.length ?? 0
      const totalCount = yesCount + noCount

      return totalCount < HOLDERS_LIMIT ? null : lastPage.next
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

export interface TopHoldersResponse {
  holders: ApiResponse
  totalPages: number
  currentPage: number
}

export const useTopHoldersPaginated = (slug?: string, page = 1, limit = HOLDERS_LIMIT) => {
  return useQuery<TopHoldersResponse, Error>({
    queryKey: ['top-holders-paginated', slug, page, limit],
    queryFn: async () => {
      if (!slug) {
        return {
          holders: { yes: { data: [], total: 0 }, no: { data: [], total: 0 } },
          totalPages: 0,
          currentPage: page,
        }
      }

      const { data: response }: AxiosResponse<ApiResponse> = await limitlessApi.get(
        `/markets/${slug}/holders`,
        {
          params: {
            page,
            limit,
          },
        }
      )

      const yesTotal = response.yes?.total ?? 0
      const noTotal = response.no?.total ?? 0
      const highestTotal = Math.max(yesTotal, noTotal)
      const totalPages = Math.ceil(highestTotal / limit)

      return {
        holders: response,
        totalPages,
        currentPage: page,
      }
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}
