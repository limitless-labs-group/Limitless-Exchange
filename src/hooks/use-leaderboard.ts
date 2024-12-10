import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { limitlessApi } from '@/services'
import { LeaderboardSort } from '@/types'

export interface LeaderboardEntity {
  account: string
  totalVolume: string
}

export interface LeaderboardResponse {
  data: LeaderboardEntity[]
  totalCount: string
}

export function useLeaderboard(param: LeaderboardSort, page: number) {
  return useQuery({
    queryKey: ['leaderboard', param, page],
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
      return limitlessApi.get(`/leaderboard/${route}`, {
        params: {
          page,
          limit: 10,
        },
      })
    },
  })
}

export function useTopThreeLeaders(param: LeaderboardSort) {
  return useQuery({
    queryKey: ['leaderboard', param, 'top-three'],
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
      return limitlessApi.get(`/leaderboard/${route}`, {
        params: {
          page: 1,
          limit: 3,
        },
      })
    },
  })
}
