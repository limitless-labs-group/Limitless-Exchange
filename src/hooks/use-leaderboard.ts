import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'
import { LeaderboardSort } from '@/types'

export interface LeaderboardEntity {
  account: string
  displayName: string
  pfpUrl: string
  totalVolume: string
  totalPoints: string
}

export interface LeaderboardResponse {
  data: LeaderboardEntity[]
  limit: number
  page: number
  totalPages: number
  totalRows: number
}

export function useLeaderboard(param: LeaderboardSort, page: number, metric: string) {
  return useQuery({
    queryKey: ['leaderboard', param, page, metric],
    queryFn: async (): Promise<LeaderboardResponse> => {
      let route
      switch (param) {
        case LeaderboardSort.MONTHLY:
          route = 'month'
          break
        case LeaderboardSort.WEEKLY:
          route = 'week'
          break
        case LeaderboardSort.DAILY:
          route = 'day'
          break
        default:
          route = 'all-time'
          break
      }
      const response = await limitlessApi.get(`/leaderboard/${route}?metric=${metric}`, {
        params: {
          page,
          limit: 10,
        },
      })
      return response.data
    },
  })
}

export function useTopThreeLeaders(param: LeaderboardSort, metric: string) {
  return useQuery({
    queryKey: ['leaderboard', param, 'top-three', metric],
    queryFn: async (): Promise<AxiosResponse<LeaderboardResponse>> => {
      let route
      switch (param) {
        case LeaderboardSort.MONTHLY:
          route = 'month'
          break
        case LeaderboardSort.WEEKLY:
          route = 'week'
          break
        case LeaderboardSort.DAILY:
          route = 'day'
          break
        default:
          route = 'all-time'
          break
      }
      return limitlessApi.get(`/leaderboard/${route}?metric=${metric}`, {
        params: {
          page: 1,
          limit: 3,
        },
      })
    },
  })
}
